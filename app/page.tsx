"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MovieCard } from "@/components/movie-card"
import { SearchFilter } from "@/components/search-filter"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { MovieDetailModal } from "@/components/movie-detail-modal" // Added movie detail modal
import { StatsOverview } from "@/components/stats-overview"
import { InstallPrompt } from "@/components/install-prompt"
import { DownloadButton } from "@/components/download-button"
import { Navbar } from "@/components/navbar"
import type { Movie } from "@/types/movie"
import toast from "react-hot-toast"
import { Loader2, Film, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "watched" | "unwatched">("all")
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; movie: Movie | null }>({
    isOpen: false,
    movie: null,
  })
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; movie: Movie | null }>({
    // Added detail modal state
    isOpen: false,
    movie: null,
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false) // Added updating state
  const [showProgressDetails, setShowProgressDetails] = useState(false)

  // Fetch movies
  const fetchMovies = async () => {
    try {
      const response = await fetch("/api/movies")
      if (!response.ok) throw new Error("Failed to fetch movies")
      const data = await response.json()
      setMovies(data)
      setFilteredMovies(data)
    } catch (error) {
      console.error("Error fetching movies:", error)
      toast.error("Failed to load movies")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter movies based on search and status
  useEffect(() => {
    let filtered = movies

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) || movie.year.toString().includes(searchQuery),
      )
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((movie) => movie.status === filterStatus)
    }

    setFilteredMovies(filtered)
  }, [movies, searchQuery, filterStatus])

  // Toggle movie status
  const handleToggleStatus = async (id: number, status: "watched" | "unwatched") => {
    setIsUpdating(true) // Added loading state for updates
    try {
      const movie = movies.find((m) => m.id === id)
      if (!movie) throw new Error("Movie not found")

      const response = await fetch(`/api/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...movie, status }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to update movie")

      setMovies((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
      toast.success(`Movie marked as ${status}`)

      if (detailModal.movie?.id === id) {
        setDetailModal((prev) => (prev.movie ? { ...prev, movie: { ...prev.movie, status } } : prev))
      }
    } catch (error) {
      console.error("Error updating movie:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update movie")
      throw error // Re-throw error for proper handling in components
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteModal.movie) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/movies/${deleteModal.movie.id}`, {
        method: "DELETE",
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to delete movie")

      setMovies((prev) => prev.filter((m) => m.id !== deleteModal.movie!.id))
      toast.success("Movie deleted successfully")
      setDeleteModal({ isOpen: false, movie: null })

      if (detailModal.movie?.id === deleteModal.movie.id) {
        setDetailModal({ isOpen: false, movie: null })
      }
    } catch (error) {
      console.error("Error deleting movie:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete movie")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (movie: Movie) => {
    try {
      router.push(`/add?edit=${movie.id}`) // Added error handling for navigation
      setDetailModal({ isOpen: false, movie: null }) // Close detail modal when editing
    } catch (error) {
      console.error("Error navigating to edit:", error)
      toast.error("Failed to open edit page")
    }
  }

  const handleMovieClick = (movie: Movie) => {
    // Added movie click handler
    setDetailModal({ isOpen: true, movie })
  }

  useEffect(() => {
    fetchMovies()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading movies...</span>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
              <p className="text-muted-foreground">
                {movies.length === 0 ? "No movies yet" : `${movies.length} movies in your collection`}
              </p>
            </div>
            {movies.length > 0 && <DownloadButton />}
          </div>
        </motion.div>

        <StatsOverview 
          movies={movies} 
          onFilterChange={setFilterStatus} 
          currentFilter={filterStatus}
          onProgressClick={() => setShowProgressDetails(true)}
        />

        <SearchFilter
          onSearch={setSearchQuery}
          onFilter={setFilterStatus}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
        />

        <AnimatePresence mode="wait">
          {filteredMovies.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-muted-foreground mb-4">
                {movies.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Film className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No movies in your watchlist</h3>
                    <p className="mb-6">Start by adding your first movie!</p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button asChild className="hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                        <Link href="/add" className="flex items-center space-x-2">
                          <Plus className="h-4 w-4" />
                          <span>Add Your First Movie</span>
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold mb-2">No movies found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence>
                {filteredMovies.map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    onEdit={handleEdit}
                    onClick={handleMovieClick} // Added click handler
                    onDelete={(id) => {
                      const movie = movies.find((m) => m.id === id)
                      if (movie) {
                        setDeleteModal({ isOpen: true, movie })
                      }
                    }}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, movie: null })}
        onConfirm={handleDelete}
        movieTitle={deleteModal.movie?.title || ""}
        isLoading={isDeleting}
      />

      <MovieDetailModal
        movie={detailModal.movie}
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, movie: null })}
        onEdit={handleEdit}
        onDelete={(id) => {
          const movie = movies.find((m) => m.id === id)
          if (movie) {
            setDeleteModal({ isOpen: true, movie })
          }
        }}
        onToggleStatus={handleToggleStatus}
        isLoading={isUpdating}
      />

      {showProgressDetails && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowProgressDetails(false)}
        >
          <motion.div
            className="bg-background rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Progress Details</h3>
              <button
                onClick={() => setShowProgressDetails(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {movies.length > 0 ? (movies.filter(m => m.status === "watched").length / movies.length * 100).toFixed(1) : "0"}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {movies.filter(m => m.status === "watched").length} of {movies.length} movies watched
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {movies.filter(m => m.status === "unwatched").length} movies remaining
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2 relative">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${movies.length > 0 ? (movies.filter(m => m.status === "watched").length / movies.length) * 100 : 0}%` 
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground">
                    {movies.length > 0 ? `${movies.filter(m => m.status === "watched").length}/${movies.length}` : "0/0"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Watched Movies:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {movies.filter(m => m.status === "watched").map(movie => (
                    <div key={movie.id} className="text-sm text-muted-foreground">
                      • {movie.title} ({movie.year})
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Remaining to Watch:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {movies.filter(m => m.status === "unwatched").map(movie => (
                    <div key={movie.id} className="text-sm text-muted-foreground">
                      • {movie.title} ({movie.year})
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-green-600">
                      {movies.filter(m => m.status === "watched").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-orange-600">
                      {movies.filter(m => m.status === "unwatched").length}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <InstallPrompt />
    </div>
  )
}
