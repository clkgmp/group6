import { type NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";

const FILE_NAME = "movies.json";

// ✅ Helper: get movies.json from Blob
async function getMovies(): Promise<any[]> {
  try {
    const blobsList = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    // Find the blob exactly named movies.json
    const file = blobsList.blobs.find((b) => b.pathname === FILE_NAME);
    if (!file) return [];

    const res = await fetch(file.url);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error("Error fetching movies from blob:", err);
    return [];
  }
}


// ✅ GET all movies
export async function GET() {
  try {
    const movies = await getMovies();
    return NextResponse.json(movies.sort((a, b) => b.id - a.id));
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}

// ✅ POST add a new movie
export async function POST(request: NextRequest) {
  try {
    const { title, year, status } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!year || year < 1900 || year > new Date().getFullYear() + 5) {
      return NextResponse.json({ error: "Valid year is required" }, { status: 400 });
    }
    if (!status || !["watched", "unwatched"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }

    const movies = await getMovies();
    const newMovie = { id: Date.now(), title: title.trim(), year, status };

    movies.push(newMovie);
    await put(FILE_NAME, JSON.stringify(movies, null, 2), {
      access: "public",
      contentType: "application/json",
        allowOverwrite: true,  
      addRandomSuffix: false,          // ⚡ important for overwrites
      ...(process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {}),
    });



    return NextResponse.json({ message: "Movie added successfully", id: newMovie.id }, { status: 201 });
  } catch (error) {
    console.error("Error adding movie:", error);
    return NextResponse.json({ error: "Failed to add movie" }, { status: 500 });
  }
}
