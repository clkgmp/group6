"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Movie, MovieFormData } from "@/types/movie"

interface MovieFormProps {
  movie?: Movie
  onSubmit: (data: MovieFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function MovieForm({ movie, onSubmit, onCancel, isLoading = false }: MovieFormProps) {
  const [formData, setFormData] = useState<MovieFormData>({
    title: movie?.title || "",
    year: movie?.year || new Date().getFullYear(),
    status: movie?.status || "unwatched",
  })
  const [errors, setErrors] = useState<{ title?: string; year?: string }>({}) // Added error state

  const validateForm = () => {
    const newErrors: { title?: string; year?: string } = {}

    if (!formData.title.trim()) {
      newErrors.title = "Movie title is required"
    }

    const currentYear = new Date().getFullYear()
    if (formData.year < 1900 || formData.year > currentYear + 5) {
      newErrors.year = `Year must be between 1900 and ${currentYear + 5}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return // Added form validation

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      setFormData({ ...formData, year: new Date().getFullYear() })
    } else {
      const yearValue = Number.parseInt(value)
      if (!isNaN(yearValue)) {
        setFormData({ ...formData, year: yearValue })
      }
    }
    if (errors.year) {
      setErrors({ ...errors, year: undefined })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <CardTitle>{movie ? "Edit Movie" : "Add New Movie"}</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="title">Movie Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter movie title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value })
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined })
                  }
                }}
                required
                className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                  errors.title ? "border-destructive" : ""
                }`}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="year">Release Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear() + 5}
                value={formData.year}
                onChange={handleYearChange} // Fixed year validation
                required
                className={`transition-all duration-200 focus:ring-2 focus:ring-primary ${
                  errors.year ? "border-destructive" : ""
                }`}
              />
              {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "watched" | "unwatched") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-primary">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unwatched">Unwatched</SelectItem>
                  <SelectItem value="watched">Watched</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              className="flex gap-2 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  variant="ghost"
                  disabled={isLoading || !formData.title.trim()} 
                  className="w-full bg-muted text-foreground font-medium hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                      className="mr-2"
                    >
                      ⟳
                    </motion.div>
                  ) : null}
                  {isLoading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
                </Button>
              </motion.div>
              {onCancel && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onCancel} 
                    disabled={isLoading}
                    className="hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  >
                    Cancel
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
