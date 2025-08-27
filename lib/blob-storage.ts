import { put, list, del } from "@vercel/blob";

const FILE_NAME = "movies.json";

// ✅ Helper: get movies.json from Blob with better error handling
export async function getMovies(): Promise<any[]> {
  try {
    const blobsList = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
    // Find the blob exactly named movies.json
    const file = blobsList.blobs.find((b) => b.pathname === FILE_NAME);
    if (!file) return [];

    const res = await fetch(file.url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching movies from blob:", err);
    return [];
  }
}

// ✅ Helper: safely write movies to Blob
export async function writeMovies(movies: any[]): Promise<boolean> {
  try {
    // First, try to delete the existing file if it exists
    try {
      const blobsList = await list({ token: process.env.BLOB_READ_WRITE_TOKEN });
      const existingFile = blobsList.blobs.find((b) => b.pathname === FILE_NAME);
      if (existingFile) {
        await del(existingFile.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
      }
    } catch (deleteError) {
      console.log("No existing file to delete or delete failed:", deleteError);
    }

    // Now create the new file
    await put(FILE_NAME, JSON.stringify(movies, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return true;
  } catch (error) {
    console.error("Error writing movies to blob:", error);
    return false;
  }
}

// ✅ Helper: create a new movie object with timestamps
export function createMovieObject(title: string, year: number, status: "watched" | "unwatched") {
  return {
    id: Date.now(),
    title: title.trim(),
    year,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// ✅ Helper: update movie timestamps
export function updateMovieTimestamps(movie: any) {
  return {
    ...movie,
    updated_at: new Date().toISOString()
  };
}
