import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Film, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <Film className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>
        <Button asChild>
          <Link href="/" className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Back to Watchlist</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
