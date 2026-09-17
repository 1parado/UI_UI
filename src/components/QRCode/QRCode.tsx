import * as React from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H'

export interface QRCodeImageSettings {
  src: string
  height: number
  width: number
  excavate: boolean
  x?: number
  y?: number
  opacity?: number
  crossOrigin?: 'anonymous' | 'use-credentials' | ''
}

interface QRCodeBaseProps {
  /** The text to encode — a URL, a pairing token, a vCard. */
  value: string | string[]
  /** Rendered size in pixels, square. */
  size?: number
  /**
   * Error correction. Higher survives more damage at the cost of density:
   * `L` ≈ 7%, `M` ≈ 15%, `Q` ≈ 25%, `H` ≈ 30%. Raise it above `M` when the
   * code will be printed, or when a logo sits in the middle.
   */
  level?: QRCodeLevel
  /**
   * Quiet zone, in modules. The spec asks for 4; without it scanners that look
   * for the surrounding white margin slow down or fail outright.
   */
  marginSize?: number
  fgColor?: string
  bgColor?: string
  /** Logo in the middle. Needs `excavate` and a higher `level` to stay scannable. */
  imageSettings?: QRCodeImageSettings
  /** Accessible name. Also rendered as the SVG `<title>`. */
  label?: string
  className?: string
  style?: React.CSSProperties
}

export type QRCodeProps = QRCodeBaseProps &
  (
    | ({ as?: 'svg' } & Omit<React.SVGAttributes<SVGSVGElement>, keyof QRCodeBaseProps>)
    | ({ as: 'canvas' } & Omit<React.CanvasHTMLAttributes<HTMLCanvasElement>, keyof QRCodeBaseProps>)
  )

/**
 * A QR code.
 *
 * **The quiet zone and the polarity are not themeable, on purpose.** A QR code
 * is read by a camera, not by an eye: dark-on-light is what the spec and every
 * scanner expect, and inverting it — a light code on a dark surface, which is
 * what `bgColor: 'hsl(var(--background))'` would produce in dark mode — is
 * rejected by a meaningful share of scanners, including some phones. So the
 * defaults here are a white background and a near-black foreground regardless
 * of the surrounding theme, and `marginSize` defaults to the spec's 4 modules
 * rather than 0. Change them only if you have tested with a real camera.
 *
 * `as="canvas"` renders a canvas you can export with `toDataURL()`; the default
 * `svg` stays sharp at any size and is what you want on screen.
 *
 * ```tsx
 * <QRCode value="https://example.com/pair?token=abc" label="Pairing code" size={160} />
 * ```
 */
function QRCode(props: QRCodeProps) {
  const {
    as,
    value,
    size = 200,
    level = 'M',
    marginSize = 4,
    fgColor = '#111827',
    bgColor = '#ffffff',
    imageSettings,
    label,
    className,
    style,
    ...rest
  } = props

  const shared = {
    value,
    size,
    level,
    marginSize,
    fgColor,
    bgColor,
    imageSettings,
    title: label,
    role: 'img',
    'aria-label': label,
    className: cn('block', className),
    style,
  }

  if (as === 'canvas') {
    return <QRCodeCanvas {...shared} {...(rest as React.CanvasHTMLAttributes<HTMLCanvasElement>)} />
  }

  return <QRCodeSVG {...shared} {...(rest as React.SVGAttributes<SVGSVGElement>)} />
}

export { QRCode }
