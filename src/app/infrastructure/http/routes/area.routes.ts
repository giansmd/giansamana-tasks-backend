import { Router } from "express";
import type { AppServices } from "../../../application/AppServices.js";

export function buildAreaRouter(services: AppServices): Router {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const data = await services.area.getAll();
      res.json({ success: true, data, total: data.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const data = await services.area.getById(req.params.id);

      if (!data) {
        res.status(404).json({ success: false, message: "Area not found" });
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/projects", async (req, res, next) => {
    try {
      const data = await services.area.getWithProjects(req.params.id);

      if (!data) {
        res.status(404).json({ success: false, message: "Area not found" });
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = await services.area.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const data = await services.area.update({
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
      await services.area.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
