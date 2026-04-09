import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";
import type {
  IBlock,
  IBlockCreateDTO,
  IBlockUpdateDTO,
} from "../../domain/models/Block.model.js";
import type { IBlockRepository } from "../../application/ports/BlockRepository.port.js";
import {
  firstRow,
  invokeRpc,
  isSchemaCacheError,
  requireFirstRow,
} from "../supabase/rpc.js";

type BlockRow = {
  id: string;
  title: string;
  completed: boolean;
  project_id: string;
  createdAt: string;
  updatedAt: string;
};

function toBlock(row: BlockRow): IBlock {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    project_id: row.project_id,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export class BlockSupabasePrismaRepository implements IBlockRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly prisma?: PrismaClient,
  ) {}

  async create(input: IBlockCreateDTO): Promise<IBlock> {
    try {
      const rows = await invokeRpc<BlockRow[]>(
        this.supabase,
        "fn_block_create",
        {
          p_title: input.title,
          p_completed: input.completed,
          p_project_id: input.project_id,
        },
      );

      return toBlock(requireFirstRow(rows, "fn_block_create"));
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.block.create({
          data: {
            title: input.title,
            completed: input.completed,
            project_id: input.project_id,
          },
        });

        return {
          id: row.id,
          title: row.title,
          completed: row.completed,
          project_id: row.project_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async update(input: IBlockUpdateDTO): Promise<IBlock> {
    try {
      const rows = await invokeRpc<BlockRow[]>(
        this.supabase,
        "fn_block_update",
        {
          p_id: input.id,
          p_title: input.title,
          p_completed: input.completed,
          p_project_id: input.project_id,
        },
      );

      return toBlock(requireFirstRow(rows, "fn_block_update"));
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const data: {
          title?: string;
          completed?: boolean;
          project_id?: string;
        } = {};

        if (input.title !== undefined) {
          data.title = input.title;
        }

        if (input.completed !== undefined) {
          data.completed = input.completed;
        }

        if (input.project_id !== undefined) {
          data.project_id = input.project_id;
        }

        const row = await this.prisma.block.update({
          where: {
            id: input.id,
          },
          data,
        });

        return {
          id: row.id,
          title: row.title,
          completed: row.completed,
          project_id: row.project_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await invokeRpc<null>(this.supabase, "fn_block_delete", {
        p_id: id,
      });
      return;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        await this.prisma.block.deleteMany({
          where: {
            id,
          },
        });
        return;
      }

      throw error;
    }
  }

  async getById(id: string): Promise<IBlock | null> {
    try {
      const rows = await invokeRpc<BlockRow[]>(
        this.supabase,
        "fn_block_get_by_id",
        {
          p_id: id,
        },
      );

      const row = firstRow(rows);
      return row ? toBlock(row) : null;
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const row = await this.prisma.block.findUnique({
          where: {
            id,
          },
        });

        if (!row) {
          return null;
        }

        return {
          id: row.id,
          title: row.title,
          completed: row.completed,
          project_id: row.project_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }

      throw error;
    }
  }

  async getAll(): Promise<IBlock[]> {
    try {
      const rows = await invokeRpc<BlockRow[]>(this.supabase, "fn_block_list");
      return rows.map(toBlock);
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const rows = await this.prisma.block.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });

        return rows.map((row) => ({
          id: row.id,
          title: row.title,
          completed: row.completed,
          project_id: row.project_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }));
      }

      throw error;
    }
  }

  async getByProjectId(projectId: string): Promise<IBlock[]> {
    try {
      const rows = await invokeRpc<BlockRow[]>(
        this.supabase,
        "fn_block_get_by_project_id",
        {
          p_project_id: projectId,
        },
      );

      return rows.map(toBlock);
    } catch (error) {
      if (isSchemaCacheError(error) && this.prisma) {
        const rows = await this.prisma.block.findMany({
          where: {
            project_id: projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return rows.map((row) => ({
          id: row.id,
          title: row.title,
          completed: row.completed,
          project_id: row.project_id,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }));
      }

      throw error;
    }
  }
}
