import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { records } from "../../../db/schema";

export async function GET() {
  const db = getDb();
  const items = await db.select().from(records).orderBy(desc(records.date), desc(records.id)).limit(100);
  return Response.json(items);
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, string>;
  if (!body.kind || !body.date || !body.title) return Response.json({ error: "信息不完整" }, { status: 400 });
  const db = getDb();
  const result = await db.insert(records).values({
    kind: body.kind as "workout" | "weight" | "meal",
    date: body.date,
    title: body.title,
    detail: body.detail || "",
    value: body.value ? Number(body.value) : null,
    createdAt: Date.now(),
  }).returning();
  return Response.json(result[0], { status: 201 });
}

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!id) return Response.json({ error: "缺少记录编号" }, { status: 400 });
  await getDb().delete(records).where(eq(records.id, id));
  return Response.json({ ok: true });
}
