const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function resolveFrontendPort() {
  try {
    const configPath = path.resolve(__dirname, "../../service-config.json");
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = JSON.parse(raw);
    return Number(parsed?.ports?.frontend) || 3000;
  } catch {
    return Number(process.env.FRONTEND_PORT || process.env.PORT) || 3000;
  }
}

const port = resolveFrontendPort();

function freePortWindows(targetPort) {
  let pids = [];

  try {
    const psCmd = `Get-NetTCPConnection -LocalPort ${targetPort} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`;
    const output = execSync(`powershell -NoProfile -Command "${psCmd}"`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();

    pids = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /^\d+$/.test(line));
  } catch {
    try {
      const netstatOutput = execSync("netstat -ano -p tcp", {
        stdio: ["ignore", "pipe", "ignore"],
        encoding: "utf8",
      });

      pids = Array.from(
        new Set(
          netstatOutput
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.includes(`:${targetPort}`) && /LISTENING/i.test(line))
            .map((line) => line.split(/\s+/).pop())
            .filter((line) => /^\d+$/.test(line))
        )
      );
    } catch {
      pids = [];
    }
  }

  if (pids.length === 0) {
    console.log(`[predev] Port ${targetPort} is free.`);
    return;
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`[predev] Stopped process ${pid} using port ${targetPort}.`);
    } catch {
      console.warn(`[predev] Could not stop process ${pid}.`);
    }
  }
}

function freePortUnix(targetPort) {
  try {
    const output = execSync(`lsof -ti tcp:${targetPort}`, {
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();

    if (!output) {
      console.log(`[predev] Port ${targetPort} is free.`);
      return;
    }

    const pids = output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => /^\d+$/.test(line));

    for (const pid of pids) {
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        console.log(`[predev] Stopped process ${pid} using port ${targetPort}.`);
      } catch {
        console.warn(`[predev] Could not stop process ${pid}.`);
      }
    }
  } catch {
    console.log(`[predev] Port ${targetPort} is free.`);
  }
}

if (process.platform === "win32") {
  freePortWindows(port);
} else {
  freePortUnix(port);
}
