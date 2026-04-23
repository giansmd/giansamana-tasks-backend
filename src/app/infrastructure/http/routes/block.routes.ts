import { Router } from 'express';
import type { AppServices } from '../../../application/AppServices.js';
import {
  buildErrorResponse,
  buildSuccessResponse,
} from '../responses/ApiResponse.js';
import {
  buildPaginationLinks,
  buildPaginationMeta,
  paginate,
  parseDateQuery,
  parsePaginationQuery,
} from './pagination.js';

function filterByCreatedAtRange<T extends { createdAt: Date }>(
  items: T[],
  fechaDesde: Date | null,
  fechaHasta: Date | null,
): T[] {
  return items.filter((item) => {
    if (fechaDesde && item.createdAt < fechaDesde) {
      return false;
    }

    if (fechaHasta && item.createdAt > fechaHasta) {
      return false;
    }

    return true;
  });
}

export function buildBlockRouter(services: AppServices): Router {
  const router = Router();

  /**
   * @openapi
   * /api/v1/blocks:
   *   get:
   *     tags: [Blocks]
   *     summary: List blocks
   *     parameters:
   *       - $ref: '#/components/parameters/PageQueryParam'
   *       - $ref: '#/components/parameters/PerPageQueryParam'
   *       - $ref: '#/components/parameters/FechaDesdeQueryParam'
   *       - $ref: '#/components/parameters/FechaHastaQueryParam'
   *     responses:
   *       200:
   *         description: Blocks retrieved successfully.
   *       400:
   *         description: Invalid date filters.
   */
  router.get('/', async (req, res, next) => {
    try {
      const fechaDesde = parseDateQuery(req.query, 'fecha_desde', 'start');
      const fechaHasta = parseDateQuery(req.query, 'fecha_hasta', 'end');

      if (fechaDesde === 'invalid' || fechaHasta === 'invalid') {
        res
          .status(400)
          .json(
            buildErrorResponse(
              'fecha_desde y fecha_hasta deben ser fechas validas (ISO-8601 o YYYY-MM-DD)',
            ),
          );
        return;
      }

      if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        res
          .status(400)
          .json(
            buildErrorResponse(
              'fecha_desde no puede ser mayor que fecha_hasta',
            ),
          );
        return;
      }

      const { page, perPage } = parsePaginationQuery(req.query);
      const items = await services.block.getAll();
      const filteredItems = filterByCreatedAtRange(
        items,
        fechaDesde,
        fechaHasta,
      );
      const { data, total } = paginate(filteredItems, page, perPage);
      const meta = buildPaginationMeta(total, page, perPage);
      const links = buildPaginationLinks(
        `${req.baseUrl}${req.path}`,
        req.query,
        page,
        perPage,
        total,
      );
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

  /**
   * @openapi
   * /api/v1/blocks/{id}:
   *   get:
   *     tags: [Blocks]
   *     summary: Get block by id
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Block retrieved successfully.
   *       404:
   *         description: Block not found.
   */
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

  /**
   * @openapi
   * /api/v1/blocks/project/{projectId}:
   *   get:
   *     tags: [Blocks]
   *     summary: List blocks by project id
   *     parameters:
   *       - in: path
   *         name: projectId
   *         required: true
   *         schema:
   *           type: string
   *       - $ref: '#/components/parameters/PageQueryParam'
   *       - $ref: '#/components/parameters/PerPageQueryParam'
   *       - $ref: '#/components/parameters/FechaDesdeQueryParam'
   *       - $ref: '#/components/parameters/FechaHastaQueryParam'
   *     responses:
   *       200:
   *         description: Blocks retrieved successfully.
   *       400:
   *         description: Invalid date filters.
   */
  router.get('/project/:projectId', async (req, res, next) => {
    try {
      const fechaDesde = parseDateQuery(req.query, 'fecha_desde', 'start');
      const fechaHasta = parseDateQuery(req.query, 'fecha_hasta', 'end');

      if (fechaDesde === 'invalid' || fechaHasta === 'invalid') {
        res
          .status(400)
          .json(
            buildErrorResponse(
              'fecha_desde y fecha_hasta deben ser fechas validas (ISO-8601 o YYYY-MM-DD)',
            ),
          );
        return;
      }

      if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        res
          .status(400)
          .json(
            buildErrorResponse(
              'fecha_desde no puede ser mayor que fecha_hasta',
            ),
          );
        return;
      }

      const { page, perPage } = parsePaginationQuery(req.query);
      const items = await services.block.getByProjectId(req.params.projectId);
      const filteredItems = filterByCreatedAtRange(
        items,
        fechaDesde,
        fechaHasta,
      );
      const { data, total } = paginate(filteredItems, page, perPage);
      const meta = buildPaginationMeta(total, page, perPage);
      const links = buildPaginationLinks(
        `${req.baseUrl}${req.path}`,
        req.query,
        page,
        perPage,
        total,
      );
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

  /**
   * @openapi
   * /api/v1/blocks:
   *   post:
   *     tags: [Blocks]
   *     summary: Create block
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/BlockCreateInput'
   *     responses:
   *       201:
   *         description: Block created successfully.
   */
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

  /**
   * @openapi
   * /api/v1/blocks/{id}:
   *   put:
   *     tags: [Blocks]
   *     summary: Update block
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
   *             $ref: '#/components/schemas/BlockUpdateInput'
   *     responses:
   *       200:
   *         description: Block updated successfully.
   */
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

  /**
   * @openapi
   * /api/v1/blocks/{id}:
   *   delete:
   *     tags: [Blocks]
   *     summary: Delete block
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Block deleted successfully.
   */
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
