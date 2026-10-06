import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, basename, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = resolve(join(__dirname, "..", "dist"));
const indexHtml = join(distDir, "index.html");
const port = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const BLOCKED_EXT = new Set([".env", ".map"]);

function isBlocked(filePath) {
  const name = basename(filePath);
  if (name.startsWith(".")) return true;
  if (BLOCKED_EXT.has(extname(name))) return true;
  return false;
}

function serveFile(res, filePath, { cache }) {
  const ext = extname(filePath);
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": cache,
    "X-Content-Type-Options": "nosniff",
  });
  res.end(readFileSync(filePath));
}

function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url || "/", "http://local").pathname);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
    return;
  }

  if (pathname === "/") pathname = "/index.html";

  const target = resolve(join(distDir, pathname));
  if (target !== distDir && !target.startsWith(distDir + sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (isBlocked(target)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (existsSync(target) && statSync(target).isFile()) {
    const cache = pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "no-cache";
    serveFile(res, target, { cache });
    return;
  }

  if (extname(pathname)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  if (existsSync(indexHtml)) {
    serveFile(res, indexHtml, { cache: "no-cache" });
    return;
  }

  res.writeHead(500);
  res.end("Build missing: dist/index.html not found. Run `npm run build`.");
}

createServer((req, res) => {
  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
}).listen(port, () => {
  console.log(`Zygn audit flow running on http://localhost:${port}`);
  if (!existsSync(indexHtml)) {
    console.error(`[boot] dist/index.html missing at ${indexHtml}. Run \`npm run build\` first.`);
  }
});
