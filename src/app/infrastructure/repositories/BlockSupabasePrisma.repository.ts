import type { SupabaseClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@prisma/client";
import type {
  IBlock,
  IBlockCreateDTO,
  IBlockUpdateDTO,
} from "../../domain/models/Block.model.js";
import type { IBlockRepository } from "../../application/ports/BlockRepository.port.js";
import { firstRow, invokeRpc, requireFirstRow, RpcError } from "../supabase/rpc.js";

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
    const rows = await invokeRpc<BlockRow[]>(this.supabase, "fn_block_create", {
      p_title: input.title,
      p_completed: input.completed,
      p_project_id: input.project_id,
    });

    return toBlock(requireFirstRow(rows, "fn_block_create"));
  }

  async update(input: IBlockUpdateDTO): Promise<IBlock> {
    const rows = await invokeRpc<BlockRow[]>(this.supabase, "fn_block_update", {
      p_id: input.id,
      p_title: input.title,
      p_completed: input.completed,
      p_project_id: input.project_id,
    });

    return toBlock(requireFirstRow(rows, "fn_block_update"));
  }

  async delete(id: string): Promise<void> {
    await invokeRpc<null>(this.supabase, "fn_block_delete", {
      p_id: id,
    });
  }

  async getById(id: string): Promise<IBlock | null> {
    const rows = await invokeRpc<BlockRow[]>(
      this.supabase,
      "fn_block_get_by_id",
      {
        p_id: id,
      },
    );

    const row = firstRow(rows);
    return row ? toBlock(row) : null;
  }

  async getAll(): Promise<IBlock[]> {
    try {
      const rows = await invokeRpc<BlockRow[]>(this.supabase, "fn_block_list");
      return rows.map(toBlock);
    } catch (error) {
      if (error instanceof RpcError && error.code === "PGRST002" && this.prisma) {
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
    const rows = await invokeRpc<BlockRow[]>(
      this.supabase,
      "fn_block_get_by_project_id",
      {
        p_project_id: projectId,
      },
    );

    return rows.map(toBlock);
  }
}
