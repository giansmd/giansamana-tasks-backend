import { Router } from "express";
import type { AppServices } from "../../../application/AppServices.js";

export function buildProjectRouter(services: AppServices): Router {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const data = await services.project.getAll();
      res.json({ success: true, data, total: data.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const data = await services.project.getById(req.params.id);

      if (!data) {
        res.status(404).json({ success: false, message: "Project not found" });
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/blocks", async (req, res, next) => {
    try {
      const data = await services.project.getWithBlocks(req.params.id);

      if (!data) {
        res.status(404).json({ success: false, message: "Project not found" });
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = await services.project.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const data = await services.project.update({
        ...req.body,
        id: req.params.id,
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      await services.project.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
