import { Router } from "express";
import type { AppServices } from "../../../application/AppServices.js";
import { buildAreaRouter } from "./area.routes.js";
import { buildProjectRouter } from "./project.routes.js";
import { buildBlockRouter } from "./block.routes.js";

export function buildApiRouter(services: AppServices): Router {
  const router = Router();

  router.use("/areas", buildAreaRouter(services));
  router.use("/projects", buildProjectRouter(services));
  router.use("/blocks", buildBlockRouter(services));

  return router;
}
