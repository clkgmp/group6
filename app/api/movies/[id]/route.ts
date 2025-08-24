import { type NextRequest, NextResponse } from "next/server";
import { put, list } from "@vercel/blob";
import { truncate } from "fs/promises";

const FILE_NAME = "movies.json";

// ✅ Helper: get movies.json from Blob
async function getMovies(): Promise<any[]> {
  try {
    const blobs = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    const file = blobs.blobs.find((b) => b.pathname === FILE_NAME);
    if (!file) return [];

    const res = await fetch(file.url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// ✅ GET single movie
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const movies = await getMovies();
    const movie = movies.find((m) => m.id === Number(id));

    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error fetching movie:", error);
    return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 });
  }
}

// ✅ PUT update movie
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, year, status } = await request.json();
    const { id } = params;

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
    const index = movies.findIndex((m) => m.id === Number(id));

    if (index === -1) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    movies[index] = { ...movies[index], title: title.trim(), year, status };

    await put(FILE_NAME, JSON.stringify(movies, null, 2), {
      access: "public",
      contentType: "application/json",
        allowOverwrite: true,  
      addRandomSuffix: false,          // ⚡ important for overwrites
      ...(process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {}),
    });



    return NextResponse.json({ message: "Movie updated successfully" });
  } catch (error) {
    console.error("Error updating movie:", error);
    return NextResponse.json({ error: "Failed to update movie" }, { status: 500 });
  }
}

// ✅ DELETE movie
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const movies = await getMovies();
    const newMovies = movies.filter((m) => m.id !== Number(id));

    if (newMovies.length === movies.length) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    await put(FILE_NAME, JSON.stringify(newMovies, null, 2), {
      access: "public",
      contentType: "application/json",
        allowOverwrite: true,  
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Error deleting movie:", error);
    return NextResponse.json({ error: "Failed to delete movie" }, { status: 500 });
  }
}
