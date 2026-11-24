import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: process.env.DOCKER_BUILD === "1" ? "standalone" : undefined,
  serverExternalPackages: ["sql.js"],
  outputFileTracingIncludes: {
    "/api/execute": [
      "./node_modules/sql.js/dist/sql-wasm.wasm",
      "./public/sql-wasm.wasm",
    ],
  },
};

export default withSerwist(nextConfig);
