const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ports = [3000, 8000];
const lockFile = path.join(__dirname, "..", "frontend", ".next", "dev", "lock");

function killPort(port) {
  if (process.platform !== "win32") return;

  try {
    const output = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();

    for (const line of output.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const match = line.trim().match(/\s(\d+)\s*$/);
      if (match) pids.add(match[1]);
    }

    for (const pid of pids) {
      if (pid === "0") continue;
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`Stopped stale process ${pid} on port ${port}`);
      } catch {
        // Process may have already exited.
      }
    }
  } catch {
    // No process is listening on this port.
  }
}

for (const port of ports) {
  killPort(port);
}

if (fs.existsSync(lockFile)) {
  fs.rmSync(lockFile, { force: true });
}
