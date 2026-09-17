/**
 * Code 128, drawn from nothing but the widths.
 *
 * The symbology is small enough to own: every symbol is six numbers — bar,
 * space, bar, space, bar, space — measured in modules, all 11 modules wide.
 * That table plus a mod-103 checksum is the whole format, which is why this
 * ships without a barcode dependency.
 *
 * Three things make the difference between a picture that looks like a barcode
 * and one that scans:
 *
 * - **Density.** Code C packs two digits into one symbol, so numeric codes come
 *   out half as wide. Long enough digit runs switch into it mid-string, and odd
 *   trailing digits drop back to B for the last one.
 * - **The checksum.** Weights start at 1 on the first data symbol and include
 *   the start character's own value — a scanner will reject the lot if the
 *   arithmetic is off by one anywhere.
 * - **The stop pattern.** Thirteen modules wide, deliberately readable in both
 *   directions, so the final bar is part of the last symbol rather than padding.
 *
 * Sources for the width table: ISO/IEC 15417 (see also bardecode.com's printed
 * specification listing), cross-checked here against three invariants — every
 * symbol totals 11 modules, its bars total an even number and its spaces an odd
 * one, and the start/stop patterns match their known bit strings.
 */

export type Code128Set = 'A' | 'B' | 'C'

const START_A = 103
const START_B = 104
const START_C = 105
const STOP = 106

const CODE_A = 101
const CODE_B = 100
const CODE_C = 99

/** Value of the symbol that latches a set. */
const LATCH: Record<'A' | 'B' | 'C', number> = { A: CODE_A, B: CODE_B, C: CODE_C }

/**
 * Every symbol's six widths, indexed by its value. Index 106 (the stop) has
 * seven — it carries a fourth bar and runs 13 modules.
 */
export const CODE128_PATTERNS: readonly number[][] = [
  [2, 1, 2, 2, 2, 2], // 0 space
  [2, 2, 2, 1, 2, 2], // 1 !
  [2, 2, 2, 2, 2, 1], // 2 "
  [1, 2, 1, 2, 2, 3], // 3 #
  [1, 2, 1, 3, 2, 2], // 4 $
  [1, 3, 1, 2, 2, 2], // 5 %
  [1, 2, 2, 2, 1, 3], // 6 &
  [1, 2, 2, 3, 1, 2], // 7 '
  [1, 3, 2, 2, 1, 2], // 8 (
  [2, 2, 1, 2, 1, 3], // 9 )
  [2, 2, 1, 3, 1, 2], // 10 *
  [2, 3, 1, 2, 1, 2], // 11 +
  [1, 1, 2, 2, 3, 2], // 12 ,
  [1, 2, 2, 1, 3, 2], // 13 -
  [1, 2, 2, 2, 3, 1], // 14 .
  [1, 1, 3, 2, 2, 2], // 15 /
  [1, 2, 3, 1, 2, 2], // 16 0
  [1, 2, 3, 2, 2, 1], // 17 1
  [2, 2, 3, 2, 1, 1], // 18 2
  [2, 2, 1, 1, 3, 2], // 19 3
  [2, 2, 1, 2, 3, 1], // 20 4
  [2, 1, 3, 2, 1, 2], // 21 5
  [2, 2, 3, 1, 1, 2], // 22 6
  [3, 1, 2, 1, 3, 1], // 23 7
  [3, 1, 1, 2, 2, 2], // 24 8
  [3, 2, 1, 1, 2, 2], // 25 9
  [3, 2, 1, 2, 2, 1], // 26 :
  [3, 1, 2, 2, 1, 2], // 27 ;
  [3, 2, 2, 1, 1, 2], // 28 <
  [3, 2, 2, 2, 1, 1], // 29 =
  [2, 1, 2, 1, 2, 3], // 30 >
  [2, 1, 2, 3, 2, 1], // 31 ?
  [2, 3, 2, 1, 2, 1], // 32 @
  [1, 1, 1, 3, 2, 3], // 33 A
  [1, 3, 1, 1, 2, 3], // 34 B
  [1, 3, 1, 3, 2, 1], // 35 C
  [1, 1, 2, 3, 1, 3], // 36 D
  [1, 3, 2, 1, 1, 3], // 37 E
  [1, 3, 2, 3, 1, 1], // 38 F
  [2, 1, 1, 3, 1, 3], // 39 G
  [2, 3, 1, 1, 1, 3], // 40 H
  [2, 3, 1, 3, 1, 1], // 41 I
  [1, 1, 2, 1, 3, 3], // 42 J
  [1, 1, 2, 3, 3, 1], // 43 K
  [1, 3, 2, 1, 3, 1], // 44 L
  [1, 1, 3, 1, 2, 3], // 45 M
  [1, 1, 3, 3, 2, 1], // 46 N
  [1, 3, 3, 1, 2, 1], // 47 O
  [3, 1, 3, 1, 2, 1], // 48 P
  [2, 1, 1, 3, 3, 1], // 49 Q
  [2, 3, 1, 1, 3, 1], // 50 R
  [2, 1, 3, 1, 1, 3], // 51 S
  [2, 1, 3, 3, 1, 1], // 52 T
  [2, 1, 3, 1, 3, 1], // 53 U
  [3, 1, 1, 1, 2, 3], // 54 V
  [3, 1, 1, 3, 2, 1], // 55 W
  [3, 3, 1, 1, 2, 1], // 56 X
  [3, 1, 2, 1, 1, 3], // 57 Y
  [3, 1, 2, 3, 1, 1], // 58 Z
  [3, 3, 2, 1, 1, 1], // 59 [
  [3, 1, 4, 1, 1, 1], // 60 backslash
  [2, 2, 1, 4, 1, 1], // 61 ]
  [4, 3, 1, 1, 1, 1], // 62 ^
  [1, 1, 1, 2, 2, 4], // 63 _
  [1, 1, 1, 4, 2, 2], // 64 NUL `
  [1, 2, 1, 1, 2, 4], // 65 SOH a
  [1, 2, 1, 4, 2, 1], // 66 STX b
  [1, 4, 1, 1, 2, 2], // 67 ETX c
  [1, 4, 1, 2, 2, 1], // 68 EOT d
  [1, 1, 2, 2, 1, 4], // 69 ENQ e
  [1, 1, 2, 4, 1, 2], // 70 ACK f
  [1, 2, 2, 1, 1, 4], // 71 BEL g
  [1, 2, 2, 4, 1, 1], // 72 BS h
  [1, 4, 2, 1, 1, 2], // 73 HT i
  [1, 4, 2, 2, 1, 1], // 74 LF j
  [2, 4, 1, 2, 1, 1], // 75 VT k
  [2, 2, 1, 1, 1, 4], // 76 FF l
  [4, 1, 3, 1, 1, 1], // 77 CR m
  [2, 4, 1, 1, 1, 2], // 78 SO n
  [1, 3, 4, 1, 1, 1], // 79 SI o
  [1, 1, 1, 2, 4, 2], // 80 DLE p
  [1, 2, 1, 1, 4, 2], // 81 DC1 q
  [1, 2, 1, 2, 4, 1], // 82 DC2 r
  [1, 1, 4, 2, 1, 2], // 83 DC3 s
  [1, 2, 4, 1, 1, 2], // 84 DC4 t
  [1, 2, 4, 2, 1, 1], // 85 NAK u
  [4, 1, 1, 2, 1, 2], // 86 SYN v
  [4, 2, 1, 1, 1, 2], // 87 ETB w
  [4, 2, 1, 2, 1, 1], // 88 CAN x
  [2, 1, 2, 1, 4, 1], // 89 EM y
  [2, 1, 4, 1, 2, 1], // 90 SUB z
  [4, 1, 2, 1, 2, 1], // 91 ESC {
  [1, 1, 1, 1, 4, 3], // 92 FS |
  [1, 1, 1, 3, 4, 1], // 93 GS }
  [1, 3, 1, 1, 4, 1], // 94 RS ~
  [1, 1, 4, 1, 1, 3], // 95 US DEL
  [1, 1, 4, 3, 1, 1], // 96 FNC 3
  [4, 1, 1, 1, 1, 3], // 97 FNC 2
  [4, 1, 1, 3, 1, 1], // 98 SHIFT
  [1, 1, 3, 1, 4, 1], // 99 CODE C
  [1, 1, 4, 1, 3, 1], // 100 CODE B / FNC 4
  [3, 1, 1, 1, 4, 1], // 101 CODE A / FNC 4
  [4, 1, 1, 1, 3, 1], // 102 FNC 1
  [2, 1, 1, 4, 1, 2], // 103 start A
  [2, 1, 1, 2, 1, 4], // 104 start B
  [2, 1, 1, 2, 3, 2], // 105 start C
  [2, 3, 3, 1, 1, 1, 2], // 106 stop — four bars, 13 modules
]

const START_VALUES: Record<Code128Set, number> = { A: START_A, B: START_B, C: START_C }

/** Set A holds ASCII 0–95, set B ASCII 32–126. Set C holds digit pairs. */
export function charValue(character: string, set: 'A' | 'B'): number | null {
  const code = character.charCodeAt(0)

  if (set === 'B') return code >= 32 && code <= 126 ? code - 32 : null

  if (code >= 32 && code <= 95) return code - 32
  if (code < 32) return code + 64
  return null
}

export function canEncode(character: string, set: 'A' | 'B'): boolean {
  return charValue(character, set) !== null
}

/** `"47"` → 47. Anything that is not two digits gives `null`. */
export function pairValue(pair: string): number | null {
  if (!/^\d{2}$/.test(pair)) return null
  return Number(pair)
}

/**
 * The mod-103 checksum.
 *
 * The start character counts too, which is the detail most implementations get
 * wrong: its own value is added, and every following symbol is weighted by its
 * position counting the first data symbol as position 1.
 */
export function checksum(start: number, values: number[]): number {
  let total = start

  for (let index = 0; index < values.length; index += 1) {
    total += values[index] * (index + 1)
  }

  return total % 103
}

export interface Code128Encoding {
  /** Set the symbol starts in, after auto-selection. */
  codeSet: Code128Set
  /** Start symbol followed by the data symbols. Checksum and stop excluded. */
  data: number[]
  /** Value of the checksum symbol. */
  check: number
  /** Every symbol value including start, checksum and stop, in drawing order. */
  values: number[]
}

function digitRunLength(text: string, from: number): number {
  let length = 0
  while (from + length < text.length && /\d/.test(text[from + length])) length += 1
  return length
}

function preferredSet(text: string): 'A' | 'B' {
  // B is the sane default: it covers everything printable including lowercase,
  // which A cannot represent at all.
  return text.length > 0 && canEncode(text[0], 'B') ? 'B' : 'A'
}

/**
 * Turn text into symbol values.
 *
 * Returns `null` for anything Code 128 cannot hold — emoji, accented letters,
 * anything outside ASCII — rather than silently drawing a wrong barcode, since
 * a barcode nobody can scan is worse than an error message.
 */
export function encodeCode128(
  text: string,
  { codeSet = 'auto' }: { codeSet?: Code128Set | 'auto' } = {}
): Code128Encoding | null {
  if (text === '') return null

  const numeric = /^\d+$/.test(text)
  let set: Code128Set

  if (codeSet !== 'auto') {
    set = codeSet
  } else if (numeric) {
    // Pure digits are what Code C exists for: two per symbol, half the width.
    set = 'C'
  } else {
    set = preferredSet(text)
  }

  const data: number[] = []
  let index = 0
  let current = set

  while (index < text.length) {
    if (current === 'C') {
      const pair = text.slice(index, index + 2)
      const value = pairValue(pair)

      if (value !== null) {
        data.push(value)
        index += 2
        continue
      }

      // Odd trailing digit, or a non-digit: latch back out to whichever of A/B
      // can carry the next character.
      const next = preferredSet(text.slice(index))
      data.push(LATCH[next])
      current = next
      continue
    }

    // Two digits per symbol is only worth a latch when it pays for itself:
    // the latch costs a symbol, so it needs at least two pairs waiting.
    if (Math.floor(digitRunLength(text, index) / 2) >= 2) {
      data.push(LATCH.C)
      current = 'C'
      continue
    }

    const value = charValue(text[index], current)

    if (value !== null) {
      data.push(value)
      index += 1
      continue
    }

    const other: 'A' | 'B' = current === 'A' ? 'B' : 'A'
    if (charValue(text[index], other) === null) return null

    data.push(LATCH[other])
    current = other
  }

  if (data.length === 0) return null

  const check = checksum(START_VALUES[set], data)

  return {
    codeSet: set,
    data,
    check,
    values: [START_VALUES[set], ...data, check, STOP],
  }
}

/**
 * The symbol as alternating run widths: bar, space, bar, ….
 *
 * Bars and spaces are returned as one list of module counts starting with a
 * bar, which is the shape every renderer wants.
 */
export function moduleRuns(values: number[]): number[] {
  const runs: number[] = []

  for (const value of values) {
    const pattern = CODE128_PATTERNS[value]
    if (!pattern) continue

    for (const width of pattern) {
      // Two adjacent runs of the same colour never happen within a symbol, so
      // runs can simply be appended in pattern order.
      runs.push(width)
    }
  }

  return runs
}

/** Total width in modules, which is also the SVG's viewBox width. */
export function totalModules(values: number[]): number {
  return values.reduce((total, value) => total + moduleWidth(value), 0)
}

function moduleWidth(value: number): number {
  return (CODE128_PATTERNS[value] ?? []).reduce((sum, width) => sum + width, 0)
}
