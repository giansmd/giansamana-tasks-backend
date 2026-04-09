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

export function buildBlockRouter(services: AppServices): Router {
  const router = Router();

  router.get('/', async (req, res, next) => {
    try {
      const data = await services.block.getAll();
      const meta: PaginationMeta = {
        total: data.length,
        perPage: data.length,
        page: 1,
      };
      const links = buildPaginationLinks(req.originalUrl);
      res.json(
        buildSuccessResponse({
          data,
          message: 'Blocks retrieved successfully',
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
      const data = await services.block.getById(req.params.id);

      if (!data) {
        res.status(404).json(buildErrorResponse('Block not found'));
        return;
      }

      res.json(
        buildSuccessResponse({ data, message: 'Block retrieved successfully' }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.get('/project/:projectId', async (req, res, next) => {
    try {
      const data = await services.block.getByProjectId(req.params.projectId);
      const meta: PaginationMeta = {
        total: data.length,
        perPage: data.length,
        page: 1,
      };
      const links = buildPaginationLinks(req.originalUrl);
      res.json(
        buildSuccessResponse({
          data,
          message: 'Blocks retrieved successfully',
          meta,
          links,
        }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const data = await services.block.create(req.body);
      res
        .status(201)
        .json(
          buildSuccessResponse({ data, message: 'Block created successfully' }),
        );
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const data = await services.block.update({
        ...req.body,
        id: req.params.id,
      });

      res.json(
        buildSuccessResponse({ data, message: 'Block updated successfully' }),
      );
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      await services.block.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
