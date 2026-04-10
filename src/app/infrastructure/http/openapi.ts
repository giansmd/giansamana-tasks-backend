import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.3',
  info: {
    title: 'Giansamana Tasks API',
    version: '1.0.0',
    description:
      'REST API documentation generated from JSDoc comments inside the codebase.',
  },
  servers: [{ url: '/', description: 'Current server' }],
  tags: [
    { name: 'Health', description: 'Service health endpoints' },
    { name: 'Areas', description: 'Area management' },
    { name: 'Projects', description: 'Project management' },
    { name: 'Blocks', description: 'Block management' },
  ],
  components: {
    schemas: {
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 10 },
          perPage: { type: 'integer', example: 10 },
          page: { type: 'integer', example: 1 },
        },
      },
      PaginationLinks: {
        type: 'object',
        properties: {
          thisPage: { type: 'string', example: '/api/v1/areas' },
          prevPage: { type: 'string', nullable: true, example: null },
          nextPage: { type: 'string', nullable: true, example: null },
          lastPage: { type: 'string', example: '/api/v1/areas' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          data: { nullable: true, example: null },
          message: { type: 'string', example: 'Resource not found' },
        },
      },
      Area: {
        type: 'object',
        required: ['id', 'name', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Backend' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AreaCreateInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Backend' },
        },
      },
      AreaUpdateInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Platform' },
        },
      },
      AreaWithProjects: {
        allOf: [
          { $ref: '#/components/schemas/Area' },
          {
            type: 'object',
            properties: {
              projects: {
                type: 'array',
                items: { $ref: '#/components/schemas/Project' },
              },
            },
          },
        ],
      },
      Project: {
        type: 'object',
        required: ['id', 'name', 'area_id', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'API Refactor' },
          area_id: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ProjectCreateInput: {
        type: 'object',
        required: ['name', 'area_id'],
        properties: {
          name: { type: 'string', example: 'API Refactor' },
          area_id: { type: 'string', format: 'uuid' },
        },
      },
      ProjectUpdateInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'API v2' },
          area_id: { type: 'string', format: 'uuid' },
        },
      },
      ProjectWithBlocks: {
        allOf: [
          { $ref: '#/components/schemas/Project' },
          {
            type: 'object',
            properties: {
              blocks: {
                type: 'array',
                items: { $ref: '#/components/schemas/Block' },
              },
            },
          },
        ],
      },
      Block: {
        type: 'object',
        required: [
          'id',
          'title',
          'completed',
          'project_id',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string', example: 'Implement OpenAPI docs' },
          completed: { type: 'boolean', example: false },
          project_id: { type: 'string', format: 'uuid' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BlockCreateInput: {
        type: 'object',
        required: ['title', 'completed', 'project_id'],
        properties: {
          title: { type: 'string', example: 'Implement OpenAPI docs' },
          completed: { type: 'boolean', example: false },
          project_id: { type: 'string', format: 'uuid' },
        },
      },
      BlockUpdateInput: {
        type: 'object',
        properties: {
          title: { type: 'string', example: 'Add Swagger UI' },
          completed: { type: 'boolean', example: true },
          project_id: { type: 'string', format: 'uuid' },
        },
      },
    },
  },
};

const swaggerOptions: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [
    path.join(currentDirPath, 'app.ts'),
    path.join(currentDirPath, 'routes/*.ts'),
  ],
};

export const openApiSpec = swaggerJSDoc(swaggerOptions);
export const swaggerUiHandlers = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(openApiSpec, {
  explorer: true,
  customSiteTitle: 'Giansamana Tasks API Docs',
});
