import { NextResponse } from "next/server";
import { list } from "@vercel/blob";

const BLOB_FILE = "movies.json";

// Helper: retrieve blob URL, then fetch JSON
async function fetchMoviesJSON() {
  const { blobs } = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
  const file = blobs.find((b) => b.pathname === BLOB_FILE);
  if (!file) return null;

  const res = await fetch(file.url);
  if (!res.ok) return null;
  return await res.json();
}

export async function GET() {
  try {
    const movies = await fetchMoviesJSON();

    if (!movies) {
      return NextResponse.json({ error: "No movie watchlist found" }, { status: 404 });
    }

    return new NextResponse(JSON.stringify(movies, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${BLOB_FILE}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting movies:", error);
    return NextResponse.json({ error: "Failed to export movies" }, { status: 500 });
  }
}
