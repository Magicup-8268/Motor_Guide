/** Preserve decimal values while accepting spaces, thousands separators and bus hyphens. */
export function normalizeSearch(text: string) {
  return text.toLowerCase().replace(/(\d),(?=\d{3}(?:\D|$))/g, '$1')
    .replace(/\d+(?:\.\d+)?/g, number => String(Number(number)))
    .replace(/[^0-9a-z가-힣.]+/g, '')
}

export function queryTerms(query: string) {
  return query.toLowerCase()
    .replace(/(\d(?:[\d,.]*))\s+(kw|w|nm|vdc|vac|v|a|rpm|mm)\b/g, '$1$2')
    .split(/\s+/).map(normalizeSearch).filter(Boolean)
}

export function containsSearchTerm(field: string, term: string) {
  let from = 0
  for (;;) {
    const at = field.indexOf(term, from)
    if (at < 0) return false
    const numeric = /^\d/.test(term)
    const leftValid = !numeric || at === 0 || !/[\d.]/.test(field[at - 1])
    const rightValid = !/\d$/.test(term) || !/[\d.]/.test(field[at + term.length] ?? '')
    if (leftValid && rightValid) return true
    from = at + 1
  }
}
