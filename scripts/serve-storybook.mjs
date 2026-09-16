#!/usr/bin/env node
/**
 * Zero-dependency static server for the Storybook build in `storybook-static/`.
 *
 * Why this exists: `python -m http.server` sends neither `Content-Encoding` nor
 * `Cache-Control`. The browser therefore pulls ~13 MB of raw JavaScript on every
 * visit and re-pulls all of it on every reload, which is what makes the preview
 * feel like it is stuck loading. This server:
 *
 *   - compresses text with brotli (falling back to gzip) — roughly 4x smaller
 *   - marks hashed bundles `immutable`, so reloads come from the disk cache
 *   - answers conditional requests with 304 instead of re-sending the body
 *   - keeps the compressed payloads in memory, so a rebuild-free reload is ~0 cost
 *
 * Usage:
 *   node scripts/serve-storybook.mjs [--port 6006] [--dir storybook-static] [--no-compress]
 */

import { createServer } from 'node:http'
import { createReadStream, promises as fs } from 'node:fs'
import { join, resolve, extname, sep } from 'node:path'
import { brotliCompressSync, gzipSync, constants as zlibConstants } from 'node:zlib'

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2)
const argOf = (name, fallback) => {
  const index = argv.indexOf(`--${name}`)
  return index !== -1 && argv[index + 1] ? argv[index + 1] : fallback
}
const PORT = Number(argOf('port', process.env.PORT ?? 6006))
const ROOT = resolve(argOf('dir', 'storybook-static'))
const COMPRESS = !argv.includes('--no-compress')

// ---------------------------------------------------------------- mime

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.txt': 'text/plain; charset=utf-8',
  '.vtt': 'text/vtt',
  '.wasm': 'application/wasm',
}

const COMPRESSIBLE = new Set([
  '.html', '.js', '.mjs', '.cjs', '.css', '.json', '.map',
  '.svg', '.txt', '.vtt', '.wasm',
])

/** Files whose names carry a content hash can be cached forever. */
const isImmutable = (pathname) =>
  pathname.startsWith('/assets/') ||
  pathname.startsWith('/sb-addons/') ||
  pathname.startsWith('/sb-manager/') ||
  /\.(woff2?|ttf|otf|png|jpe?g|gif|webp|avif|ico)$/i.test(pathname)

// ---------------------------------------------------------------- compression cache

/** @type {Map<string, {buf: Buffer, encoding: string}>} */
const compressed = new Map()
let cacheBytes = 0
const CACHE_LIMIT = 96 * 1024 * 1024 // 96 MB — the whole build compresses to ~3 MB

const MIN_COMPRESS_BYTES = 1024

function encode(body, encoding, type) {
  if (!COMPRESS) return null
  if (body.length < MIN_COMPRESS_BYTES) return null
  if (!COMPRESSIBLE.has(extname(type === undefined ? '' : type))) return null

  if (encoding === 'br') {
    const buf = brotliCompressSync(body, {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 5, // balanced: cheap at boot, strong ratio
        [zlibConstants.BROTLI_PARAM_SIZE_HINT]: body.length,
      },
    })
    // brotli occasionally loses on already-compressed input
    return buf.length < body.length ? buf : null
  }
  if (encoding === 'gzip') {
    const buf = gzipSync(body, { level: 6 })
    return buf.length < body.length ? buf : null
  }
  return null
}

function pickEncoding(acceptEncoding = '') {
  if (/\bbr\b/.test(acceptEncoding)) return 'br'
  if (/\bgzip\b/.test(acceptEncoding)) return 'gzip'
  return null
}

// ---------------------------------------------------------------- helpers

const stats = { requests: 0, served: 0, notModified: 0, bytesSent: 0, bytesSaved: 0 }

function send(res, status, headers, body) {
  res.writeHead(status, headers)
  if (body === undefined) res.end()
  else res.end(body)
}

async function resolveFile(pathname) {
  // Directory-style requests fall back to the manager entry point.
  const candidates = [pathname]
  if (pathname.endsWith('/')) candidates.push(join(pathname, 'index.html'))
  if (!extname(pathname)) candidates.push('/index.html')

  for (const candidate of candidates) {
    const abs = join(ROOT, decodeURIComponent(candidate))
    // Never escape the served directory.
    if (abs !== ROOT && !abs.startsWith(ROOT + sep)) continue
    try {
      const stat = await fs.stat(abs)
      if (stat.isFile()) return { abs, stat, urlPath: candidate }
      if (stat.isDirectory()) {
        const index = join(abs, 'index.html')
        const indexStat = await fs.stat(index)
        if (indexStat.isFile()) return { abs: index, stat: indexStat, urlPath: candidate }
      }
    } catch {
      /* try the next candidate */
    }
  }
  return null
}

// ---------------------------------------------------------------- server

const server = createServer(async (req, res) => {
  const started = process.hrtime.bigint()
  stats.requests += 1

  const url = new URL(req.url ?? '/', 'http://localhost')
  const pathname = url.pathname

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return send(res, 405, { Allow: 'GET, HEAD' })
  }

  const found = await resolveFile(pathname)
  if (!found) {
    return send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, `404 ${pathname}`)
  }

  const { abs, stat } = found
  const type = MIME[extname(abs).toLowerCase()] ?? 'application/octet-stream'
  const etag = `W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`

  const baseHeaders = {
    'Content-Type': type,
    'Cache-Control': isImmutable(found.urlPath)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
    ETag: etag,
    'Last-Modified': stat.mtime.toUTCString(),
    Vary: 'Accept-Encoding',
  }

  // Conditional request: the browser already has this exact revision.
  // Storybook's index.html / iframe.html change on every build, so this keeps
  // them fresh while everything hashed is served from disk cache untouched.
  if (req.headers['if-none-match'] === etag) {
    stats.notModified += 1
    return send(res, 304, baseHeaders)
  }

  if (req.method === 'HEAD') {
    return send(res, 200, { ...baseHeaders, 'Content-Length': String(stat.size) })
  }

  const encoding = pickEncoding(req.headers['accept-encoding'])
  if (encoding) {
    const key = `${abs}:${stat.mtimeMs}:${encoding}`
    let hit = compressed.get(key)

    if (!hit) {
      const raw = await fs.readFile(abs)
      const encoded = encode(raw, encoding, abs)
      if (encoded) {
        hit = { buf: encoded, encoding }
        if (cacheBytes + encoded.length <= CACHE_LIMIT) {
          compressed.set(key, hit)
          cacheBytes += encoded.length
        }
      }
    }

    if (hit) {
      stats.served += 1
      stats.bytesSent += hit.buf.length
      stats.bytesSaved += stat.size - hit.buf.length
      return send(res, 200, {
        ...baseHeaders,
        'Content-Encoding': hit.encoding,
        'Content-Length': String(hit.buf.length),
      }, hit.buf)
    }
  }

  stats.served += 1
  stats.bytesSent += stat.size
  res.writeHead(200, { ...baseHeaders, 'Content-Length': String(stat.size) })
  createReadStream(abs).pipe(res)
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - started) / 1e6
    if (ms > 250) console.log(`  slow  ${ms.toFixed(0)}ms  ${pathname}`)
  })
})

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use.`)
    console.error(`  Try:  node scripts/serve-storybook.mjs --port ${PORT + 1}\n`)
    process.exit(1)
  }
  throw error
})

server.listen(PORT, '127.0.0.1', async () => {
  let hasIndex = false
  try {
    await fs.access(join(ROOT, 'index.html'))
    hasIndex = true
  } catch {
    /* reported below */
  }

  if (!hasIndex) {
    console.error(`\n  ${ROOT}`)
    console.error('  does not contain a Storybook build.')
    console.error('  Run `pnpm build-storybook` first.\n')
    process.exit(1)
  }

  const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
  console.log(`\n  Storybook preview`)
  console.log(`  local    http://127.0.0.1:${PORT}/`)
  console.log(`  serving  ${ROOT}`)
  console.log(`  mode     ${COMPRESS ? 'brotli/gzip + immutable cache' : 'no compression'}`)
  console.log('\n  Ctrl+C to stop\n')

  const report = () => {
    if (!stats.served && !stats.notModified) return
    console.log(
      `  ${stats.requests} requests · ${stats.notModified} from cache (304) · ` +
        `${mb(stats.bytesSent)} sent · ${mb(stats.bytesSaved)} saved by compression`
    )
  }
  process.on('SIGINT', () => {
    report()
    server.close(() => process.exit(0))
  })
})
