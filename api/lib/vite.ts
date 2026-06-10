import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type App = Hono<{ Bindings: HttpBindings }>;

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(__dirname, "../dist/public");

  app.get("*", (c) => {
    const url = new URL(c.req.url);
    
    if (url.pathname.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }
    
    if (url.pathname.startsWith("/assets/")) {
      const filePath = path.join(distPath, url.pathname);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        const ext = path.extname(filePath);
        const contentType = {
          ".js": "application/javascript",
          ".css": "text/css",
          ".png": "image/png",
          ".jpg": "image/jpeg",
          ".svg": "image/svg+xml",
        }[ext] || "application/octet-stream";
        return new Response(content, { headers: { "Content-Type": contentType } });
      }
    }
    
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return c.json({ error: "index.html not found" }, 500);
    }
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}