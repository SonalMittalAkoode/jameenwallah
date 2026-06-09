import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const host = request.headers.get("host") || "";
  const isLocalHost =
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host.startsWith("[::1]:");

  if (!isLocalHost) {
    return NextResponse.json(
      { status: "blocked", message: "Local stack runtime is only exposed on localhost." },
      { status: 403 }
    );
  }

  try {
    const runtimePath = path.resolve(process.cwd(), "../backend/.local-stack-runtime.json");
    const raw = await fs.readFile(runtimePath, "utf8");
    const runtime = JSON.parse(raw);

    return NextResponse.json({
      status: "success",
      data: {
        startedAt: runtime.startedAt,
        port: runtime.port,
        hasLocalRuntime: true,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unavailable",
        message: "Local stack runtime not found.",
      },
      { status: 404 }
    );
  }
}
