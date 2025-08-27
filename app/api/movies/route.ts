import { type NextRequest, NextResponse } from "next/server";
import { getMovies, writeMovies, createMovieObject } from "@/lib/blob-storage";

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
    const newMovie = createMovieObject(title, year, status);

    movies.push(newMovie);
    
    const writeSuccess = await writeMovies(movies);
    if (!writeSuccess) {
      return NextResponse.json({ error: "Failed to save movie" }, { status: 500 });
    }

    return NextResponse.json({ message: "Movie added successfully", id: newMovie.id }, { status: 201 });
  } catch (error) {
    console.error("Error adding movie:", error);
    return NextResponse.json({ error: "Failed to add movie" }, { status: 500 });
  }
}
