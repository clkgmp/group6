"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { motion } from "framer-motion"
import toast from "react-hot-toast"

export function DownloadButton() {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch("/api/movies/export")

      if (!response.ok) {
        throw new Error("Failed to export movies")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "movie-watchlist.json"
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Movies exported successfully!")
    } catch (error) {
      console.error("Error downloading movies:", error)
      toast.error("Failed to export movies")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center space-x-2 bg-transparent"
      >
        <motion.div
          animate={{ rotate: isDownloading ? 360 : 0 }}
          transition={{ duration: 1, repeat: isDownloading ? Number.POSITIVE_INFINITY : 0 }}
        >
          <Download className="h-4 w-4" />
        </motion.div>
        <span>{isDownloading ? "Exporting..." : "Export"}</span>
      </Button>
    </motion.div>
  )
}
