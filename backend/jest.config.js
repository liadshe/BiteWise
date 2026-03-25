const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"           
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/src/server.ts",
    "/src/index.ts",
    "/src/tests/" 
  ],
  coverageReporters: ["html", "text", "text-summary"],

  
};