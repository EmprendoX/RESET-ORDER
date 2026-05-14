import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = (() => {
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Evita que Next bundlée isomorphic-dompurify (su dep html-encoding-sniffer
  // requiere @exodus/bytes que es ESM; al bundlear da ERR_REQUIRE_ESM en el
  // serverless de Netlify). Marcado external se carga con node_modules normales.
  serverExternalPackages: ["isomorphic-dompurify"],
  async rewrites() {
    return [
      // Next.js no resuelve index.html automáticamente para subcarpetas en /public.
      // Estos rewrites mapean /edu/ y /binaural/ -> sus index.html estáticos.
      { source: "/edu", destination: "/edu/index.html" },
      { source: "/edu/", destination: "/edu/index.html" },
      { source: "/binaural", destination: "/binaural/index.html" },
      { source: "/binaural/", destination: "/binaural/index.html" },
      // Rutas internas de la SPA de RESET-EDU (React Router) → sirven el mismo
      // index.html para que el router del cliente las maneje.
      { source: "/edu/:path((?!assets|favicon).*)", destination: "/edu/index.html" },
    ];
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
