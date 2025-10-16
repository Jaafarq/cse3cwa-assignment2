import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// NOTE: use 'any' for the 2nd arg to avoid Vercel TS signature errors
export async function GET(_req: NextRequest, ctx: any) {
  const id = ctx?.params?.id as string;

  const item = await prisma.output.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, ctx: any) {
  const id = ctx?.params?.id as string;

  await prisma.output.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
