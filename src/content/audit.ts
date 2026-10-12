// Audit numbers for the visit summary (Developer Spec §11.12). CI should
// overwrite this file after running axe + Lighthouse; until then it's null
// and the summary shows only the live focus-stop count. Never hard-code.
export const audit: { axeIssues: number; lighthouseA11y: number } | null = null;
