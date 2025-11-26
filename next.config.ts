/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@supabase/supabase-js'],
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;