import { NextResponse } from "next/server";
import { getMovies } from "@/lib/blob-storage";

export async function GET() {
  try {
    const movies = await getMovies();

    if (!movies || movies.length === 0) {
      return NextResponse.json({ error: "No movie watchlist found" }, { status: 404 });
    }

    return new NextResponse(JSON.stringify(movies, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="movies.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting movies:", error);
    return NextResponse.json({ error: "Failed to export movies" }, { status: 500 });
  }
}
