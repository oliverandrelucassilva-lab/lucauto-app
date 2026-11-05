import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os modelos do Word precisam acompanhar o servidor quando o app é publicado.
  outputFileTracingIncludes: {
    "/api/contratos/gerar": ["./moldes/modelos/**/*"],
    "/contratos/novo/[molde]": ["./moldes/modelos/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};

export default nextConfig;
