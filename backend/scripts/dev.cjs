
const path = require("path");
const { spawn } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const killPort = require("kill-port");
const port = Number(process.env.PORT) || 5050;

(async () => {
  try {
    await killPort(port);
    console.log(`Freed port ${port} (previous listener stopped, if any).`);
  } catch (_) {
   
  }

  const child = spawn("node", [path.join(__dirname, "..", "src", "index.js")], {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
    env: process.env,
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => process.exit(code ?? 0));
})();
