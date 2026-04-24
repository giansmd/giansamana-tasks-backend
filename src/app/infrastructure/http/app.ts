import cors from 'cors';
import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import type { AppServices } from '../../application/AppServices.js';
import { buildApiRouter } from './routes/index.js';
import {
  buildErrorResponse,
  buildSuccessResponse,
} from './responses/ApiResponse.js';
import { openApiSpec, swaggerUiHandlers, swaggerUiSetup } from './openapi.js';

function requireDocsBasicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const configuredUser = process.env.DOCS_BASIC_AUTH_USER;
  const configuredPassword = process.env.DOCS_BASIC_AUTH_PASSWORD;

  if (!configuredUser || !configuredPassword) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="API Docs"');
    res
      .status(401)
      .json(buildErrorResponse('Authentication required to access /docs'));
    return;
  }

  const encodedCredentials = authHeader.slice(6).trim();
  const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
    'utf8',
  );
  const separatorIndex = decodedCredentials.indexOf(':');

  if (separatorIndex < 0) {
    res.setHeader('WWW-Authenticate', 'Basic realm="API Docs"');
    res
      .status(401)
      .json(buildErrorResponse('Authentication required to access /docs'));
    return;
  }

  const username = decodedCredentials.slice(0, separatorIndex);
  const password = decodedCredentials.slice(separatorIndex + 1);

  if (username !== configuredUser || password !== configuredPassword) {
    res.setHeader('WWW-Authenticate', 'Basic realm="API Docs"');
    res.status(401).json(buildErrorResponse('Invalid credentials for /docs'));
    return;
  }

  next();
}

export function buildHttpApp(services: AppServices): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/docs.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use('/docs', requireDocsBasicAuth, swaggerUiHandlers, swaggerUiSetup);

  /**
   * @openapi
   * /health:
   *   get:
   *     tags: [Health]
   *     summary: Health check
   *     description: Returns API health status.
   *     responses:
   *       200:
   *         description: Service is healthy.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     status:
   *                       type: string
   *                       example: ok
   *                 message:
   *                   type: string
   *                   example: Service is healthy
   */
  app.get('/health', (_req, res) => {
    res.json(
      buildSuccessResponse({
        data: { status: 'ok' },
        message: 'Service is healthy',
      }),
    );
  });

  app.use('/api/v1', buildApiRouter(services));

  app.use((req: Request, res: Response) => {
    res
      .status(404)
      .json(buildErrorResponse(`Route ${req.method} ${req.path} not found`));
  });

  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      const message =
        error instanceof Error ? error.message : 'Internal server error';

      res.status(500).json(buildErrorResponse(message));
    },
  );

  return app;
}
