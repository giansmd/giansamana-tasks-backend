import { Router } from "express";
import type { AppServices } from "../../../application/AppServices.js";

export function buildBlockRouter(services: AppServices): Router {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const data = await services.block.getAll();
      res.json({ success: true, data, total: data.length });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const data = await services.block.getById(req.params.id);

      if (!data) {
        res.status(404).json({ success: false, message: "Block not found" });
        return;
      }

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/project/:projectId", async (req, res, next) => {
    try {
      const data = await services.block.getByProjectId(req.params.projectId);
      res.json({ success: true, data, total: data.length });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const data = await services.block.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const data = await services.block.update({
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
      await services.block.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
