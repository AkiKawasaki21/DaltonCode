/**
 * Prefixes a public-folder path with the deployment basePath.
 *
 * Next applies `basePath` to its own router and to next/image, but NOT to raw
 * `src`/`srcSet` attributes. Every hand-written asset URL has to go through
 * here or it 404s wherever the site is not served from the domain root.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function asset(path: string): string {
  return `${BASE_PATH}${path}`
}
