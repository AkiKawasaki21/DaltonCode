/**
 * GitHub Pages serves this repo at /DaltonCode, so the export needs a
 * basePath. It is env-driven so `npm run dev` still serves from the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  reactStrictMode: true,
  trailingSlash: true,
  // Pages has no image optimiser; everything here is plain <img>/<picture>.
  images: { unoptimized: true },
  // Production builds go to their own directory so `npm run build` can never
  // overwrite the chunks a live `next dev` is serving.
  distDir: process.env.BUILD_DIR || '.next',
}

export default nextConfig
