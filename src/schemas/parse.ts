import type { APIResponse } from '@playwright/test';
import { z } from 'zod';

export async function parseBody<T extends z.ZodType>(
  res: APIResponse,
  schema: T,
): Promise<z.infer<T>> {
  const json = await res.json();
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new Error(
      `Contract violation at ${res.url()} (status ${res.status()}):\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}