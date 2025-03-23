/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['zcsiothpblweexkabfum.supabase.co'], // Add your Supabase domain
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false, // Remove the X-Powered-By header for security
  reactStrictMode: true,
  // swcMinify is now enabled by default in Next.js 15, so we can remove it
  // Add other configuration options as needed
};

module.exports = nextConfig; 