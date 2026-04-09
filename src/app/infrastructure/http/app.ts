import cors from "cors";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import type { AppServices } from "../../application/AppServices.js";
import { buildApiRouter } from "./routes/index.js";

export function buildHttpApp(services: AppServices): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", buildApiRouter(services));

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : "Internal server error";

    res.status(500).json({
      success: false,
      message,
    });
  });

  return app;
}
