// Money helpers shared by the forms and the tables. Must stay plain, erasable TypeScript so `node --test` runs it directly.

/** Decimals per currency; the backend uses the same table. COP and CLP are whole units. */
export const CURRENCIES: Record<string, number> = { COP: 0, USD: 2, EUR: 2, MXN: 2, PEN: 2, ARS: 2, CLP: 0 }

/**
 * Reads what people actually type: "90.000" or "90,000" for pesos, "12,50" or "1.234,50" for euros.
 * Returns null when it is not a positive amount with at most the currency's decimals.
 */
export function parseAmount(input: string, currency: string): number | null {
  const scale = CURRENCIES[currency] ?? 2
  let s = input.replace(/[\s$€]/g, '')
  if (!s) return null
  if (scale === 0) {
    // whole units: dots and commas can only be thousands separators
    if (!/^\d{1,3}([.,]\d{3})*$|^\d+$/.test(s)) return null
    s = s.replace(/[.,]/g, '')
  } else {
    const lastDot = s.lastIndexOf('.')
    const lastComma = s.lastIndexOf(',')
    const dec = Math.max(lastDot, lastComma)
    // a separator followed by exactly 3 digits, with no other kind present, is a thousands separator ("1,000")
    const onlyOneKind = lastDot === -1 || lastComma === -1
    const tail = dec === -1 ? '' : s.slice(dec + 1)
    if (dec !== -1 && onlyOneKind && tail.length === 3 && s.indexOf(s[dec]) === dec && scale < 3) {
      s = s.replace(/[.,]/g, '')
    } else if (dec !== -1) {
      s = s.slice(0, dec).replace(/[.,]/g, '') + '.' + tail
    }
    if (!/^\d+(\.\d+)?$/.test(s)) return null
    if ((s.split('.')[1] ?? '').length > scale) return null
  }
  const n = Number(s)
  return n > 0 && Number.isFinite(n) ? n : null
}

export function formatMoney(amount: number, currency: string, locale: string): string {
  const scale = CURRENCIES[currency] ?? 2
  return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: scale, maximumFractionDigits: scale }).format(amount)
}
