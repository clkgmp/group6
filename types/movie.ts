export interface Movie {
  id: number
  title: string
  year: number
  status: "watched" | "unwatched"
  created_at?: string
  updated_at?: string
}

export interface MovieFormData {
  title: string
  year: number
  status: "watched" | "unwatched"
}
