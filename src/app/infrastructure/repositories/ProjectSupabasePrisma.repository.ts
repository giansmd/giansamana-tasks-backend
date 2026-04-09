import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IProject,
  IProjectCreateDTO,
  IProjectUpdateDTO,
  IProjectWithBlocks,
} from "../../domain/models/Project.model.js";
import type { IProjectRepository } from "../../application/ports/ProjectRepository.port.js";
import { firstRow, invokeRpc, requireFirstRow } from "../supabase/rpc.js";

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
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: IProjectCreateDTO): Promise<IProject> {
    const rows = await invokeRpc<ProjectRow[]>(
      this.supabase,
      "fn_project_create",
      {
        p_name: input.name,
        p_area_id: input.area_id,
      },
    );

    return toProject(requireFirstRow(rows, "fn_project_create"));
  }

  async update(input: IProjectUpdateDTO): Promise<IProject> {
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
  }

  async delete(id: string): Promise<void> {
    await invokeRpc<null>(this.supabase, "fn_project_delete", {
      p_id: id,
    });
  }

  async getById(id: string): Promise<IProject | null> {
    const rows = await invokeRpc<ProjectRow[]>(
      this.supabase,
      "fn_project_get_by_id",
      {
        p_id: id,
      },
    );

    const row = firstRow(rows);
    return row ? toProject(row) : null;
  }

  async getAll(): Promise<IProject[]> {
    const rows = await invokeRpc<ProjectRow[]>(
      this.supabase,
      "fn_project_list",
    );
    return rows.map(toProject);
  }

  async getWithBlocks(id: string): Promise<IProjectWithBlocks | null> {
    const rows = await invokeRpc<ProjectWithBlocksRow[]>(
      this.supabase,
      "fn_project_get_with_blocks",
      {
        p_id: id,
      },
    );

    const row = firstRow(rows);
    return row ? toProjectWithBlocks(row) : null;
  }
}
