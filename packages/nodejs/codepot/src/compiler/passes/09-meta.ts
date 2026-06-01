// src/compiler/passes/09-meta.ts

import type { CompilerContext } from '../context/compiler-context';

export function compileMeta(ctx: CompilerContext): void {
  ctx.ir.codepot = ctx.authoring.codepot;
  ctx.ir.key = ctx.authoring.key;
  ctx.ir.version = ctx.authoring.version;
  ctx.ir.info = ctx.authoring.info;
  ctx.ir.urls = [...(ctx.authoring.urls ?? [])] as unknown as typeof ctx.ir.urls;

  ctx.ir.content_types.json = {
    type: 'application/json',
    strategy: 'json',
  };

  ctx.ir.content_types.multipart = {
    type: 'multipart/form-data',
    strategy: 'multipart',
  };

  ctx.ir.content_types.xml = {
    type: 'application/xml',
    strategy: 'xml',
  };

  ctx.ir.content_types.csv = {
    type: 'text/csv',
    strategy: 'csv',
  };
}
