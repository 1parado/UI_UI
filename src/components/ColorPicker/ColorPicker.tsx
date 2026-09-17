import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/Popover'
import { useControllableString } from '@/lib/use-controllable-state'
import {
  DEFAULT_COLOR_PRESETS,
  hexToHsv,
  hsvToRgb,
  parseHex,
  rgbToHex,
  rgbToHsv,
  type Hsv,
} from '@/lib/color'
import { ChevronDownIcon } from '@/lib/icons'

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

const triggerClassName =
  'inline-flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

export interface ColorSwatchProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Any `#rgb` / `#rrggbb` string. Unparseable input falls back to transparent. */
  color: string
}

/**
 * A single colour chip. Exported on its own because a swatch is useful well
 * outside the picker — legends, tags, list markers.
 */
const ColorSwatch = React.forwardRef<HTMLSpanElement, ColorSwatchProps>(
  ({ color, className, style, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      style={{ backgroundColor: color, ...style }}
      className={cn(
        'inline-block h-4 w-4 shrink-0 rounded-sm border border-border',
        className
      )}
      {...props}
    />
  )
)
ColorSwatch.displayName = 'ColorSwatch'

export interface ColorPickerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Controlled value, `#rrggbb`. */
  value?: string
  /** Starting value when the picker owns its state. */
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Swatches offered under the sliders. */
  presets?: readonly string[]
  /**
   * Use the operating system's own colour dialog instead of the built-in
   * panel. Worth turning on where the platform picker is genuinely better —
   * touch devices, or a page that already feels native.
   */
  native?: boolean
  /** Show the hex string next to the swatch on the trigger. */
  showValue?: boolean
  /** Submitted with the surrounding form when a `name` is given. */
  name?: string
  disabled?: boolean
  /** Where the panel lines up against the trigger. */
  align?: 'start' | 'center' | 'end'
  /** Accessible name for the control. */
  'aria-label'?: string
}

/**
 * A colour picker with a hue slider, a saturation/brightness square and a hex
 * field. Nothing is pulled in for the colour maths — `lib/color` does the
 * conversions — so this stays a no-dependency component.
 *
 * Keyboard access runs through the hex field and the hue slider. The square
 * needs two axes and ARIA has no two-dimensional slider, so rather than fake
 * one, the hex field is treated as the complete path to any value and the
 * square is pointer-only, hidden from assistive tech.
 *
 * ```tsx
 * const [brand, setBrand] = React.useState('#2563eb')
 * <ColorPicker value={brand} onValueChange={setBrand} />
 * ```
 */
const ColorPicker = React.forwardRef<HTMLDivElement, ColorPickerProps>(
  (
    {
      value,
      defaultValue,
      onValueChange,
      presets = DEFAULT_COLOR_PRESETS,
      native = false,
      showValue = true,
      name,
      disabled,
      align = 'start',
      className,
      id,
      'aria-label': ariaLabel = 'Color',
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [color, setColor] = useControllableString({
      value,
      defaultValue: defaultValue ?? '#000000',
      onValueChange,
    })

    const [hsv, setHsv] = React.useState<Hsv>(() => hexToHsv(color) ?? { h: 0, s: 0, v: 0 })
    const [text, setText] = React.useState(color)
    // The last hex this picker wrote. Distinguishes "the caller changed the
    // value" from "we just echoed back what we emitted" — without it, dragging
    // saturation to zero would reset the hue and make the slider jump home.
    const lastEmitted = React.useRef(color)

    React.useEffect(() => {
      if (color === lastEmitted.current) return
      lastEmitted.current = color
      setText(color)
      const next = hexToHsv(color)
      if (next) setHsv(next)
    }, [color])

    const commit = React.useCallback(
      (next: Hsv) => {
        const hex = rgbToHex(hsvToRgb(next))
        setHsv(next)
        setText(hex)
        lastEmitted.current = hex
        setColor(hex)
      },
      [setColor]
    )

    const applyHex = React.useCallback(
      (input: string) => {
        const rgb = parseHex(input)
        if (!rgb) return
        const hex = rgbToHex(rgb)
        setHsv(rgbToHsv(rgb))
        setText(hex)
        lastEmitted.current = hex
        setColor(hex)
      },
      [setColor]
    )

    /* ---- pointer handling -------------------------------------------------
     * jsdom and any un-laid-out document report a zero-sized rect, and
     * dividing by that width would put the handle at infinity. Bail out
     * instead; tests drive this component through the hex field.
     */
    const squareRef = React.useRef<HTMLDivElement>(null)
    const squareRect = React.useRef<DOMRect | null>(null)
    const squareDragging = React.useRef(false)
    const hueRef = React.useRef<HTMLDivElement>(null)
    const hueRect = React.useRef<DOMRect | null>(null)
    const hueDragging = React.useRef(false)

    const fromSquare = (clientX: number, clientY: number) => {
      const rect = squareRect.current
      if (!rect || rect.width === 0 || rect.height === 0) return
      commit({
        h: hsv.h,
        s: clamp01((clientX - rect.left) / rect.width),
        v: 1 - clamp01((clientY - rect.top) / rect.height),
      })
    }

    const fromHue = (clientX: number) => {
      const rect = hueRect.current
      if (!rect || rect.width === 0) return
      commit({ ...hsv, h: clamp01((clientX - rect.left) / rect.width) * 360 })
    }

    const startSquare = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const rect = squareRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0) return
      squareRect.current = rect
      squareDragging.current = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      fromSquare(event.clientX, event.clientY)
    }

    const startHue = (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return
      const rect = hueRef.current?.getBoundingClientRect()
      if (!rect || rect.width === 0) return
      hueRect.current = rect
      hueDragging.current = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      fromHue(event.clientX)
    }

    const stopDragging = () => {
      squareDragging.current = false
      hueDragging.current = false
      squareRect.current = null
      hueRect.current = null
    }

    const onHueKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return
      const step = event.shiftKey ? 10 : 1
      const moves: Record<string, number> = {
        ArrowRight: step,
        ArrowUp: step,
        ArrowLeft: -step,
        ArrowDown: -step,
      }

      if (event.key in moves) {
        event.preventDefault()
        commit({ ...hsv, h: (((hsv.h + moves[event.key]) % 360) + 360) % 360 })
      } else if (event.key === 'Home') {
        event.preventDefault()
        commit({ ...hsv, h: 0 })
      } else if (event.key === 'End') {
        event.preventDefault()
        commit({ ...hsv, h: 359 })
      }
    }

    const pureHue = rgbToHex(hsvToRgb({ h: hsv.h, s: 1, v: 1 }))

    if (native) {
      return (
        <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
          <input
            type="color"
            id={id}
            name={name}
            value={color}
            disabled={disabled}
            aria-label={ariaLabel}
            onChange={(event) => applyHex(event.target.value)}
            className={cn(
              'h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          />
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
        {/* Keeps the picker part of its surrounding form. */}
        {name && <input type="hidden" name={name} value={color} />}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              id={id}
              disabled={disabled}
              aria-label={ariaLabel}
              aria-haspopup="dialog"
              aria-expanded={open}
              className={triggerClassName}
            >
              <ColorSwatch color={color} />
              {showValue && (
                <span className="font-mono text-xs uppercase tabular-nums">{color}</span>
              )}
              <ChevronDownIcon aria-hidden="true" className="h-4 w-4 opacity-50" />
            </button>
          </PopoverTrigger>

          <PopoverContent align={align} className="w-64 space-y-3">
            {/* Saturation / brightness — pointer-only, see the component note. */}
            <div
              ref={squareRef}
              aria-hidden="true"
              onPointerDown={startSquare}
              onPointerMove={(event) => {
                if (squareDragging.current) fromSquare(event.clientX, event.clientY)
              }}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              style={{
                backgroundColor: pureHue,
                backgroundImage:
                  'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
              }}
              className="relative h-32 w-full cursor-crosshair touch-none rounded-md border border-border"
            >
              <span
                className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
              />
            </div>

            <div
              ref={hueRef}
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label="Hue"
              aria-valuemin={0}
              aria-valuemax={360}
              aria-valuenow={Math.round(hsv.h)}
              aria-valuetext={`${Math.round(hsv.h)} degrees`}
              aria-disabled={disabled || undefined}
              onPointerDown={startHue}
              onPointerMove={(event) => {
                if (hueDragging.current) fromHue(event.clientX)
              }}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onKeyDown={onHueKeyDown}
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
              }}
              className="relative h-3 w-full cursor-pointer touch-none rounded-full border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                style={{ left: `${(hsv.h / 360) * 100}%`, backgroundColor: pureHue }}
              />
            </div>

            <div className="flex items-center gap-2">
              <ColorSwatch color={color} className="h-8 w-8" />
              <Input
                value={text}
                disabled={disabled}
                aria-label={`${ariaLabel} hex value`}
                spellCheck={false}
                onChange={(event) => {
                  const raw = event.target.value
                  setText(raw)
                  const rgb = parseHex(raw)
                  if (!rgb) return
                  // Leave `text` as typed — only the committed value snaps.
                  const hex = rgbToHex(rgb)
                  setHsv(rgbToHsv(rgb))
                  lastEmitted.current = hex
                  setColor(hex)
                }}
                // Show the real value again if the entry was left half-finished.
                onBlur={() => setText(color)}
                className="h-8 flex-1 font-mono text-xs uppercase"
              />
            </div>

            <div className="grid grid-cols-10 gap-1">
              {presets.map((preset) => {
                const rgb = parseHex(preset)
                const hex = rgb ? rgbToHex(rgb) : null
                const selected = hex !== null && hex === color.toLowerCase()
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={disabled}
                    aria-label={preset}
                    aria-pressed={selected}
                    onClick={() => applyHex(preset)}
                    style={{ backgroundColor: preset }}
                    className={cn(
                      'h-5 w-full rounded-sm border border-border transition-transform hover:scale-110',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                      selected && 'ring-2 ring-ring ring-offset-1'
                    )}
                  />
                )
              })}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => commit({ h: 0, s: 0, v: 1 })}
              className="h-7 px-2 text-xs text-muted-foreground"
            >
              Reset to white
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    )
  }
)
ColorPicker.displayName = 'ColorPicker'

export { ColorPicker, ColorSwatch, DEFAULT_COLOR_PRESETS }
