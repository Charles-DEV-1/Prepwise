import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const command = process.argv[2] ?? "dev";
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, command, ...process.argv.slice(3)], {
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_IGNORE_INCORRECT_LOCKFILE: "1",
  },
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
