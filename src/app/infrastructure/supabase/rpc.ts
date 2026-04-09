import type { SupabaseClient } from "@supabase/supabase-js";

export class RpcError extends Error {
  constructor(
    public readonly fn: string,
    public readonly code: string | null,
    public readonly details: string | null,
    public readonly hint: string | null,
    message: string,
  ) {
    super(`RPC ${fn} failed: ${message}`);
    this.name = "RpcError";
  }
}

export async function invokeRpc<TResponse>(
  client: SupabaseClient,
  fn: string,
  params?: Record<string, unknown>,
): Promise<TResponse> {
  const { data, error } = await client.schema("public").rpc(fn, params);

  if (error) {
    throw new RpcError(
      fn,
      error.code ?? null,
      error.details ?? null,
      error.hint ?? null,
      error.message,
    );
  }

  return data as TResponse;
}

export function firstRow<T>(rows: T[] | null): T | null {
  if (!rows || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  return row ?? null;
}

export function requireFirstRow<T>(rows: T[] | null, rpcName: string): T {
  const row = firstRow(rows);

  if (!row) {
    throw new Error(`RPC ${rpcName} returned no rows`);
  }

  return row;
}
