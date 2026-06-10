import { createRouter, publicQuery } from "./middleware";
import { leadRouter } from "./leadRouter";
import { webhookRouter } from "./webhookRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  lead: leadRouter,
  webhook: webhookRouter,
});

export type AppRouter = typeof appRouter;
