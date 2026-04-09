import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";
import type {
  IArea,
  IAreaCreateDTO,
  IAreaUpdateDTO,
  IAreaWithProjects,
} from "../../domain/models/Area.model.js";
import type { IAreaRepository } from "../../application/ports/AreaRepository.port.js";
import {
  firstRow,
  invokeRpc,
  isSchemaCacheError,
  requireFirstRow,
} from "../supabase/rpc.js";

type AreaRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type AreaWithProjectsRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  projects: {
    id: string;
    name: string;
    area_id: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

function toArea(row: AreaRow): IArea {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function toAreaWithProjects(row: AreaWithProjectsRow): IAreaWithProjects {
  return {
    id: row.id,
    name: row.name,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    projects: row.projects.map((project) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    })),
  };
}

export class AreaSupabasePrismaRepository implements IAreaRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly prisma?: PrismaClient,
  ) {}

  async create(input: IAreaCreateDTO): Promise<IArea> {
    try {
      const rows = await invokeRpc<AreaRow[]>(this.supabase, "fn_area_create", {
        p_name: input.name,
      });

      return toArea(requireFirstRow(rows, "fn_area_create"));
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.area.create({
          data: {
            name: input.name,
          },
        });

        return {
          id: row.id,
          name: row.name,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async update(input: IAreaUpdateDTO): Promise<IArea> {
    try {
      const rows = await invokeRpc<AreaRow[]>(this.supabase, "fn_area_update", {
        p_id: input.id,
        p_name: input.name,
      });

      return toArea(requireFirstRow(rows, "fn_area_update"));
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const data: { name?: string } = {};

        if (input.name !== undefined) {
          data.name = input.name;
        }

        const row = await this.prisma.area.update({
          where: {
            id: input.id,
          },
          data,
        });

        return {
          id: row.id,
          name: row.name,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await invokeRpc<null>(this.supabase, "fn_area_delete", {
        p_id: id,
      });
      return;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        await this.prisma.area.deleteMany({
          where: {
            id,
          },
        });
        return;
      }

      throw error;
    }
  }

  async getById(id: string): Promise<IArea | null> {
    try {
      const rows = await invokeRpc<AreaRow[]>(
        this.supabase,
        "fn_area_get_by_id",
        {
          p_id: id,
        },
      );

      const row = firstRow(rows);
      return row ? toArea(row) : null;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.area.findUnique({
          where: {
            id,
          },
        });

        if (!row) {
          return null;
        }

        return {
          id: row.id,
          name: row.name,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async getAll(): Promise<IArea[]> {
    try {
      const rows = await invokeRpc<AreaRow[]>(this.supabase, "fn_area_list");
      return rows.map(toArea);
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const rows = await this.prisma.area.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

        return rows.map((row) => ({
          id: row.id,
          name: row.name,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }));
      }

      throw error;
    }
  }

  async getWithProjects(id: string): Promise<IAreaWithProjects | null> {
    try {
      const rows = await invokeRpc<AreaWithProjectsRow[]>(
        this.supabase,
        "fn_area_get_with_projects",
        {
          p_id: id,
        },
      );

      const row = firstRow(rows);
      return row ? toAreaWithProjects(row) : null;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.area.findUnique({
          where: {
            id,
          },
          include: {
            projects: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        });

        if (!row) {
          return null;
        }

        return {
          id: row.id,
          name: row.name,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          projects: row.projects.map((project) => ({
            id: project.id,
            name: project.name,
            area_id: project.area_id,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          })),
        };
      }

      throw error;
    }
  }
}
