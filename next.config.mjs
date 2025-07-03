const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    WEAVIATE_URL: process.env.WEAVIATE_URL ?? 'MISSING',
    WEAVIATE_API_KEY: process.env.WEAVIATE_API_KEY ?? 'MISSING',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? 'MISSING',
  },
};

export default nextConfig;
