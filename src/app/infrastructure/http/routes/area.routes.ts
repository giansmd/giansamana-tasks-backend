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
