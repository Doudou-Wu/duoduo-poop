const { buildSync } = require("esbuild");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const directory = fs.mkdtempSync(
  path.join(require("node:os").tmpdir(), "duoduo-tests-"),
);
const outfile = path.join(directory, "tests.cjs");
buildSync({
  entryPoints: [path.join(__dirname, "database.test.ts")],
  outfile,
  bundle: true,
  platform: "node",
  format: "cjs",
  alias: {
    "expo-crypto": path.join(__dirname, "crypto-adapter.ts"),
    "expo-sqlite": path.join(__dirname, "sqlite-adapter.ts"),
  },
});
const result = spawnSync(process.execPath, ["--test", outfile], {
  stdio: "inherit",
});
fs.rmSync(outfile);
fs.rmdirSync(directory);
process.exit(result.status ?? 1);
