import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
      // Allow any IPFS gateway (dynamic hostname)
      {
        protocol: "https",
        hostname: "**",
        pathname: "/ipfs/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Use require to access webpack without TypeScript issues
    const webpack = require("webpack");

    // Ignore test files and test-related dependencies from bundling
    config.plugins = [
      ...(config.plugins || []),
      // Ignore test files (.test.js, .test.mjs, etc.)
      new webpack.IgnorePlugin({
        resourceRegExp: /\.test\.(js|mjs|ts|tsx)$/,
      }),
      // Ignore test directories in node_modules
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /node_modules/,
      }),
      // Ignore test-related npm packages (tap, tape, why-is-node-running)
      new webpack.IgnorePlugin({
        resourceRegExp: /^(tap|why-is-node-running|tape)$/,
      }),
      // Ignore React Native dependencies (not needed for web app)
      // MetaMask SDK tries to import these but they're only for React Native
      new webpack.IgnorePlugin({
        resourceRegExp: /^@react-native-async-storage\/async-storage$/,
      }),
    ];

    // Prevent webpack from trying to resolve test dependencies and React Native packages
    if (config.resolve) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        tap: false,
        "why-is-node-running": false,
        tape: false,
        "@react-native-async-storage/async-storage": false,
      };
    }

    return config;
  },
};

export default nextConfig;
