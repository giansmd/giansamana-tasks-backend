import { bootstrapApp, type AppServices } from "./app/index.js";
import type { Server } from "node:http";
import { buildHttpApp } from "./app/infrastructure/http/index.js";
import type {
  IArea,
  IAreaCreateDTO,
  IAreaUpdateDTO,
  IBlock,
  IBlockCreateDTO,
  IBlockUpdateDTO,
  IProject,
  IProjectCreateDTO,
  IProjectUpdateDTO,
} from "./app/domain/models/index.js";

let prismaDisconnect: (() => Promise<void>) | null = null;
let servicesInstance: AppServices | null = null;
let httpServerInstance: Server | null = null;

export async function startServer(): Promise<AppServices> {
  if (servicesInstance) {
    return servicesInstance;
  }

  const { prisma, services } = await bootstrapApp();
  prismaDisconnect = () => prisma.$disconnect();
  servicesInstance = services;
  return services;
}

export async function stopServer(): Promise<void> {
  if (httpServerInstance) {
    await new Promise<void>((resolve, reject) => {
      httpServerInstance?.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
    httpServerInstance = null;
  }

  if (prismaDisconnect) {
    await prismaDisconnect();
  }

  servicesInstance = null;
  prismaDisconnect = null;
}

export async function startHttpServer(
  port = Number(process.env.PORT ?? 3000),
): Promise<Server> {
  if (httpServerInstance) {
    return httpServerInstance;
  }

  const services = await startServer();
  const app = buildHttpApp(services);

  const server = await new Promise<Server>((resolve, reject) => {
    const instance = app.listen(port, () => resolve(instance));
    instance.on("error", reject);
  });

  httpServerInstance = server;
  return server;
}

export type {
  IArea,
  IAreaCreateDTO,
  IAreaUpdateDTO,
  IProject,
  IProjectCreateDTO,
  IProjectUpdateDTO,
  IBlock,
  IBlockCreateDTO,
  IBlockUpdateDTO,
};
