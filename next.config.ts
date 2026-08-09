import type { NextConfig } from "next";

// Photos posted to the tree are served from Supabase Storage, so next/image
// has to be told that host is allowed. Derived from the env var rather than
// hardcoded, so a different Supabase project needs no code change.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
