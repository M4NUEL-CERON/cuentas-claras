/** Member names are unique per group regardless of case, the same rule the API enforces. */
export const sameName = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()
