import { Router } from 'express';
import type { AppServices } from '../../../application/AppServices.js';
import {
  buildErrorResponse,
  buildSuccessResponse,
  type PaginationLinks,
  type PaginationMeta,
} from '../responses/ApiResponse.js';

function buildPaginationLinks(path: string): PaginationLinks {
  return {
    thisPage: path,
    prevPage: null,
    nextPage: null,
    lastPage: path,
  };
}

export function buildAreaRouter(services: AppServices): Router {
  const router = Router();

  /**
   * @openapi
   * /api/v1/areas:
   *   get:
   *     tags: [Areas]
   *     summary: List areas
   *     responses:
   *       200:
   *         description: Areas retrieved successfully.
   */
  router.get('/', async (req, res, next) => {
    try {
      const data = await services.area.getAll();
      const meta: PaginationMeta = {
        total: data.length,
        perPage: data.length,
        page: 1,
      };
      const links = buildPaginationLinks(req.originalUrl);
      res.json(
        buildSuccessResponse({
          data,
          message: 'Areas retrieved successfully',
          meta,
          links,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /api/v1/areas/{id}:
   *   get:
   *     tags: [Areas]
   *     summary: Get area by id
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Area retrieved successfully.
   *       404:
   *         description: Area not found.
   */
  router.get('/:id', async (req, res, next) => {
    try {
      const data = await services.area.getById(req.params.id);

      if (!data) {
        res.status(404).json(buildErrorResponse('Area not found'));
        return;
      }

      res.json(
        buildSuccessResponse({ data, message: 'Area retrieved successfully' }),
      );
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /api/v1/areas/{id}/projects:
   *   get:
   *     tags: [Areas]
   *     summary: Get area with projects
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Area with projects retrieved successfully.
   *       404:
   *         description: Area not found.
   */
  router.get('/:id/projects', async (req, res, next) => {
    try {
      const data = await services.area.getWithProjects(req.params.id);

      if (!data) {
        res.status(404).json(buildErrorResponse('Area not found'));
        return;
      }

      res.json(
        buildSuccessResponse({
          data,
          message: 'Area with projects retrieved successfully',
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /api/v1/areas:
   *   post:
   *     tags: [Areas]
   *     summary: Create area
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AreaCreateInput'
   *     responses:
   *       201:
   *         description: Area created successfully.
   */
  router.post('/', async (req, res, next) => {
    try {
      const data = await services.area.create(req.body);
      res
        .status(201)
        .json(
          buildSuccessResponse({ data, message: 'Area created successfully' }),
        );
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /api/v1/areas/{id}:
   *   put:
   *     tags: [Areas]
   *     summary: Update area
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/AreaUpdateInput'
   *     responses:
   *       200:
   *         description: Area updated successfully.
   */
  router.put('/:id', async (req, res, next) => {
    try {
      const data = await services.area.update({
        ...req.body,
        id: req.params.id,
      });

      res.json(
        buildSuccessResponse({ data, message: 'Area updated successfully' }),
      );
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /api/v1/areas/{id}:
   *   delete:
   *     tags: [Areas]
   *     summary: Delete area
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Area deleted successfully.
   */
  router.delete('/:id', async (req, res, next) => {
    try {
      await services.area.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
