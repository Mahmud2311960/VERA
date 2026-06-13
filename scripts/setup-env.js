const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function copyIfMissing(source, target) {
  if (fs.existsSync(target)) return;
  if (!fs.existsSync(source)) return;
  fs.copyFileSync(source, target);
  console.log(`Created ${path.relative(root, target)}`);
}

copyIfMissing(
  path.join(root, "backend", ".env.example"),
  path.join(root, "backend", ".env"),
);
copyIfMissing(
  path.join(root, "frontend", ".env.local.example"),
  path.join(root, "frontend", ".env.local"),
);
