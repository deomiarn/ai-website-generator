import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

const CreateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureUniqueSlug(baseSlug: string, ownerId: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.project.findFirst({
      where: {
        ownerId,
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existing) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// GET /api/projects - List projects with pagination and search
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "ACTIVE";

    const skip = (page - 1) * limit;

    const where = {
      ownerId: session.user.id,
      status: status as "ACTIVE" | "ARCHIVED",
      ...(q && {
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    console.error("Error fetching projects:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = CreateProjectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { name, description } = result.data;
    const baseSlug = generateSlug(name);
    const slug = await ensureUniqueSlug(baseSlug, session.user.id);

    const project = await prisma.project.create({
      data: {
        name,
        description,
        slug,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err: unknown) {
    console.error("Error creating project:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
