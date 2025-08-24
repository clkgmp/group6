"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Film, TrendingUp } from "lucide-react"
import type { Movie } from "@/types/movie"

interface StatsOverviewProps {
  movies: Movie[]
  onFilterChange?: (status: "all" | "watched" | "unwatched") => void
  currentFilter?: "all" | "watched" | "unwatched"
  onProgressClick?: () => void
}

export function StatsOverview({ movies, onFilterChange, currentFilter, onProgressClick }: StatsOverviewProps) {
  const totalMovies = movies.length
  const watchedMovies = movies.filter((movie) => movie.status === "watched").length
  const unwatchedMovies = movies.filter((movie) => movie.status === "unwatched").length
  const watchedPercentage = totalMovies > 0 ? (watchedMovies / totalMovies) * 100 : 0
  const roundedPercentage = Math.round(watchedPercentage)
  const decimalPercentage = watchedPercentage.toFixed(1)

  const stats = [
    {
      title: "Total Movies",
      value: totalMovies,
      icon: Film,
      color: "text-primary",
    },
    {
      title: "Watched",
      value: watchedMovies,
      icon: Eye,
      color: "text-green-600",
    },
    {
      title: "Unwatched",
      value: unwatchedMovies,
      icon: EyeOff,
      color: "text-orange-600",
    },
    {
      title: "Progress",
      value: `${roundedPercentage}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      subtitle: totalMovies > 0 ? `${watchedMovies}/${totalMovies} movies` : "No movies",
      decimalValue: decimalPercentage,
    },
  ]

  if (totalMovies === 0) return null

  return (
    <div className="mb-8">
      {currentFilter && currentFilter !== "all" && (
        <motion.div
          className="mb-4 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-sm text-muted-foreground">
            Showing {currentFilter === "watched" ? "watched" : "unwatched"} movies
          </span>
          {onFilterChange && (
            <button
              onClick={() => onFilterChange("all")}
              className="text-sm text-primary hover:underline transition-colors"
            >
              Show all movies
            </button>
          )}
        </motion.div>
            )}
             <motion.div
         className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.4, delay: 0.2 }}
       >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card 
              className={`h-full ${
                (onFilterChange && (stat.title === "Total Movies" || stat.title === "Watched" || stat.title === "Unwatched")) ||
                (onProgressClick && stat.title === "Progress")
                  ? "cursor-pointer hover:shadow-md transition-all duration-200" 
                  : ""
              } ${
                currentFilter === "all" && stat.title === "Total Movies"
                  ? "ring-2 ring-primary bg-primary/5 dark:bg-primary/10"
                  : currentFilter === "watched" && stat.title === "Watched"
                  ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20"
                  : currentFilter === "unwatched" && stat.title === "Unwatched"
                  ? "ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : ""
              }`}
              onClick={() => {
                if (onFilterChange && stat.title === "Total Movies") {
                  onFilterChange("all")
                } else if (onFilterChange && stat.title === "Watched") {
                  onFilterChange("watched")
                } else if (onFilterChange && stat.title === "Unwatched") {
                  onFilterChange("unwatched")
                } else if (onProgressClick && stat.title === "Progress") {
                  onProgressClick()
                }
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.title === "Progress" && stat.subtitle && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {stat.subtitle}
                  </div>
                )}
                {stat.title !== "Progress" && (
                  <div className="text-xs text-muted-foreground mt-1 opacity-0">
                    &nbsp;
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
      </motion.div>
    </div>
  )
}
