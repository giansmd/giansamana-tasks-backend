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

export function buildProjectRouter(services: AppServices): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const data = await services.project.getAll();
      const meta: PaginationMeta = {
        total: data.length,
        perPage: data.length,
        page: 1,
      };
      const links = buildPaginationLinks(req.originalUrl);
      res.json(
        buildSuccessResponse({
          data,
          message: 'Projects retrieved successfully',
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
      const data = await services.project.getById(req.params.id);

      if (!data) {
        res.status(404).json(buildErrorResponse('Project not found'));
        return;
      }

      res.json(
        buildSuccessResponse({
          data,
          message: 'Project retrieved successfully',
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id/blocks', async (req, res, next) => {
    try {
      const data = await services.project.getWithBlocks(req.params.id);

      if (!data) {
        res.status(404).json(buildErrorResponse('Project not found'));
        return;
      }

      res.json(
        buildSuccessResponse({
          data,
          message: 'Project with blocks retrieved successfully',
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const data = await services.project.create(req.body);
      res
        .status(201)
        .json(
          buildSuccessResponse({
            data,
            message: 'Project created successfully',
          }),
        );
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const data = await services.project.update({
        ...req.body,
        id: req.params.id,
      });

      res.json(
        buildSuccessResponse({ data, message: 'Project updated successfully' }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await services.project.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
