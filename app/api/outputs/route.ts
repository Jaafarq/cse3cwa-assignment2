import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireNonEmptyString } from "@/lib/validate";
import { stripDangerous } from "@/lib/htmlSanitizer";

export async function GET() {
  const items = await prisma.output.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const title = requireNonEmptyString(data.title, "title");
    const htmlRaw = requireNonEmptyString(data.html, "html");
    const html = stripDangerous(htmlRaw);

    const created = await prisma.output.create({
      data: { title, html },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message ?? err) }, { status: 400 });
  }
}
