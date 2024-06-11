import { router } from "../trpc";
import { openFilesRouter } from "./routes/filesOpen";

export const openApiRouter = router({
  files: openFilesRouter,
});

export type OpenApiRouter = typeof openApiRouter;
