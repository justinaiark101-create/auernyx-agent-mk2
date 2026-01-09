import fs from "fs";
import path from "path";

const ROOT_DIRS = ["core", "clients", "capabilities"];

function listTsFiles(dirPath) {
    const out = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
        if (e.name === "node_modules" || e.name === "dist") continue;
        const fp = path.join(dirPath, e.name);
        if (e.isDirectory()) out.push(...listTsFiles(fp));
        else if (e.isFile() && e.name.endsWith(".ts") && !e.name.endsWith(".d.ts")) out.push(fp);
    }
    return out;
}

function hasKnownExtension(spec) {
    return /\.[a-z0-9]+$/i.test(spec);
}

function shouldAppendJs(spec) {
    if (!spec.startsWith(".")) return false;
    if (spec.endsWith(".js") || spec.endsWith(".mjs") || spec.endsWith(".cjs") || spec.endsWith(".json") || spec.endsWith(".node")) return false;
    if (spec.includes("?") || spec.includes("#")) return false;
    if (hasKnownExtension(spec)) return false;
    return true;
}

function rewriteSpec(spec) {
    return shouldAppendJs(spec) ? `${spec}.js` : spec;
}

function rewriteFile(filePath) {
    const before = fs.readFileSync(filePath, "utf8");
    let after = before;

    // `import ... from "..."` and `export ... from "..."`.
    after = after.replace(/\b(from)\s+(['"])(\.[^'"]*)\2/g, (m, kw, quote, spec) => {
        const next = rewriteSpec(spec);
        return `${kw} ${quote}${next}${quote}`;
    });

    // Side-effect imports: `import "./x"`.
    after = after.replace(/\bimport\s+(['"])(\.[^'"]*)\1/g, (m, quote, spec) => {
        const next = rewriteSpec(spec);
        return `import ${quote}${next}${quote}`;
    });

    if (after !== before) fs.writeFileSync(filePath, after, "utf8");
}

for (const d of ROOT_DIRS) {
    const abs = path.join(process.cwd(), d);
    if (!fs.existsSync(abs)) continue;
    for (const fp of listTsFiles(abs)) rewriteFile(fp);
}

