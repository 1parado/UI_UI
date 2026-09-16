#!/usr/bin/env node
/**
 * Cross-platform directory remover, used to reset build output before a build.
 *
 * Storybook's static build is not reliably reproducible on this project: a build
 * that is interrupted (Ctrl+C, CI cancellation, OOM) leaves partially written
 * `assets/*` behind, and the next build adds a fresh set of content hashes
 * without removing the old ones. That silently grew the output from 8.7 MB to
 * 13.1 MB over a handful of runs. Starting from an empty directory keeps the
 * artifact deterministic and keeps the deployed site small.
 *
 * Usage: node scripts/clean.mjs <dir> [dir...]
 */

import { rmSync } from 'node:fs'

const targets = process.argv.slice(2)

if (targets.length === 0) {
  console.error('usage: node scripts/clean.mjs <dir> [dir...]')
  process.exit(1)
}

for (const target of targets) {
  rmSync(target, { recursive: true, force: true })
}
