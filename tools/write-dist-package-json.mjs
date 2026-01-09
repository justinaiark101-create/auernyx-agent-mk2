import fs from "fs";
import path from "path";

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

const repoRoot = process.cwd();
const distCjs = path.join(repoRoot, "dist", "cjs");
const distEsm = path.join(repoRoot, "dist", "esm");

writeJson(path.join(distCjs, "package.json"), { type: "commonjs" });
writeJson(path.join(distEsm, "package.json"), { type: "module" });

