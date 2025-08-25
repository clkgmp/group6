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
import { Loader2, Film, Plus, TrendingUp, X, CheckCircle, Clock, Eye, EyeOff } from "lucide-react"
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
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py- md:py-8">
        <motion.div
          className="mb-4 md:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">My Watchlist</h1>
              <p className="text-muted-foreground text-sm md:text-base">
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowProgressDetails(false)}
        >
          <motion.div
            className="bg-background/95 backdrop-blur-sm border rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Progress Details</h3>
              </div>
              <button
                onClick={() => setShowProgressDetails(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Progress Summary Card */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 text-center border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">
                  {movies.length > 0 ? (movies.filter(m => m.status === "watched").length / movies.length * 100).toFixed(1) : "0"}%
                </div>
                <div className="text-lg font-medium text-foreground mb-1">
                  {movies.filter(m => m.status === "watched").length} of {movies.length} movies watched
                </div>
                <div className="text-sm text-muted-foreground">
                  {movies.filter(m => m.status === "unwatched").length} movies remaining
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Progress</span>
                  <span className="text-muted-foreground">
                    {movies.length > 0 ? `${movies.filter(m => m.status === "watched").length}/${movies.length}` : "0/0"}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ 
                      width: `${movies.length > 0 ? (movies.filter(m => m.status === "watched").length / movies.length) * 100 : 0}%` 
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {movies.filter(m => m.status === "watched").length}
                  </div>
                  <div className="text-sm text-green-600/80 font-medium">Completed</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {movies.filter(m => m.status === "unwatched").length}
                  </div>
                  <div className="text-sm text-orange-600/80 font-medium">Pending</div>
                </div>
              </div>
              
              {/* Movie Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Watched Movies */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-green-500/20 rounded-lg">
                      <Eye className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-foreground">Watched Movies</h4>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {movies.filter(m => m.status === "watched").length > 0 ? (
                      movies.filter(m => m.status === "watched").map(movie => (
                        <div key={movie.id} className="flex items-center space-x-2 p-2 bg-background rounded-md hover:bg-muted/50 transition-colors">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm text-foreground font-medium">{movie.title}</span>
                          <span className="text-xs text-muted-foreground">({movie.year})</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No movies watched yet</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Remaining to Watch */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-orange-500/20 rounded-lg">
                      <EyeOff className="h-4 w-4 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-foreground">Remaining to Watch</h4>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                    {movies.filter(m => m.status === "unwatched").length > 0 ? (
                      movies.filter(m => m.status === "unwatched").map(movie => (
                        <div key={movie.id} className="flex items-center space-x-2 p-2 bg-background rounded-md hover:bg-muted/50 transition-colors">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span className="text-sm text-foreground font-medium">{movie.title}</span>
                          <span className="text-xs text-muted-foreground">({movie.year})</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">All movies watched!</p>
                      </div>
                    )}
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
