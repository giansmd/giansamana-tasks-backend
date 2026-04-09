import { PrismaPg } from "@prisma/adapter-pg";
import { AppServices } from "./AppServices.js";
import {
  AreaSupabasePrismaRepository,
  BlockSupabasePrismaRepository,
  ProjectSupabasePrismaRepository,
} from "../infrastructure/repositories/index.js";
import { createSupabaseRpcClient } from "../infrastructure/supabase/client.js";
import { PrismaClient } from "../../../generated/prisma/client.js";

export type BootstrapContext = {
  prisma: PrismaClient;
  services: AppServices;
};

export async function bootstrapApp(): Promise<BootstrapContext> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  const supabase = createSupabaseRpcClient();

  const services = new AppServices({
    area: new AreaSupabasePrismaRepository(supabase),
    project: new ProjectSupabasePrismaRepository(supabase),
    block: new BlockSupabasePrismaRepository(supabase),
  });

  return {
    prisma,
    services,
  };
}
