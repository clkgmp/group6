"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter: (status: "all" | "watched" | "unwatched") => void
  searchQuery: string
  filterStatus: "all" | "watched" | "unwatched"
}

export function SearchFilter({ onSearch, onFilter, searchQuery, filterStatus }: SearchFilterProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearch(value)
  }

  const clearSearch = () => {
    setLocalSearch("")
    onSearch("")
  }

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative flex-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search movies..."
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
        />
        {localSearch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
        <Select value={filterStatus} onValueChange={(value: "all" | "watched" | "unwatched") => onFilter(value)}>
          <SelectTrigger className="w-full sm:w-48 pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Movies</SelectItem>
            <SelectItem value="watched">Watched</SelectItem>
            <SelectItem value="unwatched">Unwatched</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>
    </motion.div>
  )
}
