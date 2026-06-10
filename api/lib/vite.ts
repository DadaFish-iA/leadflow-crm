import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

type App = Hono<{ Bindings: HttpBindings }>;

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(__dirname, "../dist/public");

  // Serve static files from /assets/
  app.use("/assets/*", serveStatic({ root: "./dist/public" }));

  // For all other routes, serve index.html (SPA fallback)
  app.get("*", (c) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return c.json({ error: "index.html not found" }, 500);
    }
    const content = fs.readFileSync(indexPath, "utf-8");
    return c.html(content);
  });
}