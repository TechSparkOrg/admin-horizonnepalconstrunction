export interface AdminReview {
  id: string
  name: string
  rating: number
  description: string
  status: "pending" | "read" | "published" | "ignored"
  order: number
  created_at: string
  updated_at: string
}

export type AdminReviewCreate = Pick<AdminReview, "name" | "rating" | "description">

export type AdminReviewUpdate = Partial<AdminReviewCreate> & { status?: AdminReview["status"] }
