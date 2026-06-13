const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dbPath = path.join(root, "backend", "vera.db");

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

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
        execSync(`taskkill /PID ${pid} /F /T`, { stdio: "ignore" });
        console.log(`Stopped process tree ${pid} on port ${port}`);
      } catch {
        // Process may have already exited.
      }
    }
  } catch {
    // No process is listening on this port.
  }
}

function killBackendPythonProcesses() {
  if (process.platform !== "win32") return;

  const veraRoot = root.replace(/\\/g, "\\\\");
  const script = `
    Get-CimInstance Win32_Process -Filter "Name = 'python.exe'" |
      Where-Object { $_.CommandLine -like '*uvicorn*' -and $_.CommandLine -like '*${veraRoot}*' } |
      ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  `;

  try {
    execSync(`powershell -NoProfile -Command "${script.replace(/\n/g, " ")}"`, { stdio: "ignore" });
  } catch {
    // No matching processes.
  }
}

function resetSchema() {
  execSync(
    "python -c \"from app.core.database import Base, engine; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine); print('Database schema reset complete.')\"",
    {
      cwd: path.join(root, "backend"),
      stdio: "inherit",
    },
  );
}

function tryRemoveDbFile() {
  if (!fs.existsSync(dbPath)) return;

  try {
    fs.rmSync(dbPath, { force: true });
    console.log("Removed backend/vera.db");
  } catch {
    console.log("Could not remove backend/vera.db (file may be locked). Schema was still reset.");
  }
}

console.log("Stopping dev servers and backend processes...");
killPort(8000);
killPort(3000);
killBackendPythonProcesses();
sleep(1000);

if (!fs.existsSync(dbPath)) {
  console.log("No database file yet. Tables will be created on next `npm run dev`.");
  process.exit(0);
}

resetSchema();
tryRemoveDbFile();
console.log("Done. Run `npm run dev` to start fresh.");
