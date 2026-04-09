import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";
import type {
  IProject,
  IProjectCreateDTO,
  IProjectUpdateDTO,
  IProjectWithBlocks,
} from "../../domain/models/Project.model.js";
import type { IProjectRepository } from "../../application/ports/ProjectRepository.port.js";
import {
  firstRow,
  invokeRpc,
  isSchemaCacheError,
  requireFirstRow,
} from "../supabase/rpc.js";

type ProjectRow = {
  id: string;
  name: string;
  area_id: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectWithBlocksRow = {
  id: string;
  name: string;
  area_id: string;
  createdAt: string;
  updatedAt: string;
  blocks: {
    id: string;
    title: string;
    completed: boolean;
    project_id: string;
    createdAt: string;
    updatedAt: string;
  }[];
};

function toProject(row: ProjectRow): IProject {
  return {
    id: row.id,
    name: row.name,
    area_id: row.area_id,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function toProjectWithBlocks(row: ProjectWithBlocksRow): IProjectWithBlocks {
  return {
    id: row.id,
    name: row.name,
    area_id: row.area_id,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    blocks: row.blocks.map((block) => ({
      ...block,
      createdAt: new Date(block.createdAt),
      updatedAt: new Date(block.updatedAt),
    })),
  };
}

export class ProjectSupabasePrismaRepository implements IProjectRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly prisma?: PrismaClient,
  ) {}

  async create(input: IProjectCreateDTO): Promise<IProject> {
    try {
      const rows = await invokeRpc<ProjectRow[]>(
        this.supabase,
        "fn_project_create",
        {
          p_name: input.name,
          p_area_id: input.area_id,
        },
      );

      return toProject(requireFirstRow(rows, "fn_project_create"));
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.project.create({
          data: {
            name: input.name,
            area_id: input.area_id,
          },
        });

        return {
          id: row.id,
          name: row.name,
          area_id: row.area_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async update(input: IProjectUpdateDTO): Promise<IProject> {
    try {
      const rows = await invokeRpc<ProjectRow[]>(
        this.supabase,
        "fn_project_update",
        {
          p_id: input.id,
          p_name: input.name,
          p_area_id: input.area_id,
        },
      );

      return toProject(requireFirstRow(rows, "fn_project_update"));
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const data: { name?: string; area_id?: string } = {};

        if (input.name !== undefined) {
          data.name = input.name;
        }

        if (input.area_id !== undefined) {
          data.area_id = input.area_id;
        }

        const row = await this.prisma.project.update({
          where: {
            id: input.id,
          },
          data,
        });

        return {
          id: row.id,
          name: row.name,
          area_id: row.area_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await invokeRpc<null>(this.supabase, "fn_project_delete", {
        p_id: id,
      });
      return;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        await this.prisma.project.deleteMany({
          where: {
            id,
          },
        });
        return;
      }

      throw error;
    }
  }

  async getById(id: string): Promise<IProject | null> {
    try {
      const rows = await invokeRpc<ProjectRow[]>(
        this.supabase,
        "fn_project_get_by_id",
        {
          p_id: id,
        },
      );

      const row = firstRow(rows);
      return row ? toProject(row) : null;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.project.findUnique({
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
          area_id: row.area_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async getAll(): Promise<IProject[]> {
    try {
      const rows = await invokeRpc<ProjectRow[]>(
        this.supabase,
        "fn_project_list",
      );
      return rows.map(toProject);
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const rows = await this.prisma.project.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

        return rows.map((row) => ({
          id: row.id,
          name: row.name,
          area_id: row.area_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }));
      }

      throw error;
    }
  }

  async getWithBlocks(id: string): Promise<IProjectWithBlocks | null> {
    try {
      const rows = await invokeRpc<ProjectWithBlocksRow[]>(
        this.supabase,
        "fn_project_get_with_blocks",
        {
          p_id: id,
        },
      );

      const row = firstRow(rows);
      return row ? toProjectWithBlocks(row) : null;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.project.findUnique({
          where: {
            id,
          },
          include: {
            blocks: {
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
          area_id: row.area_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          blocks: row.blocks.map((block) => ({
            id: block.id,
            title: block.title,
            completed: block.completed,
            project_id: block.project_id,
            createdAt: block.createdAt,
            updatedAt: block.updatedAt,
          })),
        };
      }

      throw error;
    }
  }
}
