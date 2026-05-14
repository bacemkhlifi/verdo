import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const copyIfExists = (sourceName) => {
  const sourcePath = path.join(rootDir, sourceName);
  const targetPath = path.join(distDir, sourceName);

  if (!fs.existsSync(sourcePath)) {
    return;
  }

  fs.copyFileSync(sourcePath, targetPath);
};

try {
  copyIfExists("_redirects");
  copyIfExists("netlify.toml");
  console.log("Postbuild files copied successfully.");
} catch (error) {
  console.error("Postbuild copy failed:", error);
  process.exit(1);
}
