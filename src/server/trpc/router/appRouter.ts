import { router } from "../trpc";
import { apiKeysRouter } from "./routes/apiKeys";
import { appsRouter } from "./routes/apps";
import { filesRouter } from "./routes/files";
import { planRouter } from "./routes/plan";
import { storagesRouter } from "./routes/storages";

export const appRouter = router({
  files: filesRouter,
  apps: appsRouter,
  storages: storagesRouter,
  apiKeys: apiKeysRouter,
  plan: planRouter,
});

export type AppRouter = typeof appRouter;
