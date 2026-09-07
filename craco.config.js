/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  }
};
