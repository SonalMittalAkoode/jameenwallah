import { spawn } from "node:child_process";
import { once } from "node:events";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import {
  printVerificationResult,
  verifyPage,
} from "./verify-next-deployment-assets.mjs";

const DEFAULT_PORT = Number(process.env.VERIFY_PRODUCTION_PORT || 3020);
const HOST = "127.0.0.1";
const ROUTES_TO_VERIFY = ["/", "/cmsadminlogin/ai-suggestion-staging"];

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function waitForServer(origin, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(origin, { cache: "no-store" });
      if (response.status < 500) {
        return;
      }
    } catch {
      // Server is still starting.
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for ${origin}`);
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.kill("SIGTERM");
  await Promise.race([
    once(child, "exit"),
    delay(5000).then(() => {
      if (child.exitCode === null) {
        child.kill("SIGKILL");
      }
    }),
  ]);
}

async function main() {
  const nextCli = "node_modules/next/dist/bin/next";
  const origin = `http://${HOST}:${DEFAULT_PORT}`;
  const buildDirectory = resolve(process.cwd(), ".next");

  await rm(buildDirectory, { recursive: true, force: true });
  await runCommand(process.execPath, [nextCli, "build"]);

  const server = spawn(process.execPath, [nextCli, "start", "-p", String(DEFAULT_PORT)], {
    stdio: "inherit",
    shell: false,
  });

  try {
    await waitForServer(origin);

    let hasFailure = false;
    for (const route of ROUTES_TO_VERIFY) {
      const result = await verifyPage(`${origin}${route}`);
      printVerificationResult(result);
      if (!result.ok) {
        hasFailure = true;
      }
    }

    if (hasFailure) {
      throw new Error("Local production asset verification failed.");
    }
  } finally {
    await stopServer(server);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
