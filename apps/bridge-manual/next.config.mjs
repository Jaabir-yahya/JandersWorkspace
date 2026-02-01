const nextConfig = {
  // Apply Vercel best practices: optimize package imports
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Apply Vercel best practices: bundle optimization
  compiler: {
    removeUnusedImports: true,
  },
  // Railway integration
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
