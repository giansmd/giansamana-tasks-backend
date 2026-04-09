import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  IArea,
  IAreaCreateDTO,
  IAreaUpdateDTO,
  IAreaWithProjects,
} from "../../domain/models/Area.model.js";
import type { IAreaRepository } from "../../application/ports/AreaRepository.port.js";
import { firstRow, invokeRpc, requireFirstRow } from "../supabase/rpc.js";

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
  constructor(private readonly supabase: SupabaseClient) {}

  async create(input: IAreaCreateDTO): Promise<IArea> {
    const rows = await invokeRpc<AreaRow[]>(this.supabase, "fn_area_create", {
      p_name: input.name,
    });

    return toArea(requireFirstRow(rows, "fn_area_create"));
  }

  async update(input: IAreaUpdateDTO): Promise<IArea> {
    const rows = await invokeRpc<AreaRow[]>(this.supabase, "fn_area_update", {
      p_id: input.id,
      p_name: input.name,
    });

    return toArea(requireFirstRow(rows, "fn_area_update"));
  }

  async delete(id: string): Promise<void> {
    await invokeRpc<null>(this.supabase, "fn_area_delete", {
      p_id: id,
    });
  }

  async getById(id: string): Promise<IArea | null> {
    const rows = await invokeRpc<AreaRow[]>(
      this.supabase,
      "fn_area_get_by_id",
      {
        p_id: id,
      },
    );

    const row = firstRow(rows);
    return row ? toArea(row) : null;
  }

  async getAll(): Promise<IArea[]> {
    const rows = await invokeRpc<AreaRow[]>(this.supabase, "fn_area_list");
    return rows.map(toArea);
  }

  async getWithProjects(id: string): Promise<IAreaWithProjects | null> {
    const rows = await invokeRpc<AreaWithProjectsRow[]>(
      this.supabase,
      "fn_area_get_with_projects",
      {
        p_id: id,
      },
    );

    const row = firstRow(rows);
    return row ? toAreaWithProjects(row) : null;
  }
}
