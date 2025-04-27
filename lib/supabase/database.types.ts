export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          author: string
          description: string | null
          isbn: string | null
          condition: "New" | "Like New" | "Very Good" | "Good" | "Acceptable"
          cover_image: string | null
          listing_type: string
          price: number | null
          owner_id: string
          category_id: number | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author: string
          description?: string | null
          isbn?: string | null
          condition: "New" | "Like New" | "Very Good" | "Good" | "Acceptable"
          cover_image?: string | null
          listing_type: string
          price?: number | null
          owner_id: string
          category_id?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string
          description?: string | null
          isbn?: string | null
          condition?: "New" | "Like New" | "Very Good" | "Good" | "Acceptable"
          cover_image?: string | null
          listing_type?: string
          price?: number | null
          owner_id?: string
          category_id?: number | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          book_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          created_at?: string
        }
      }
    }
  }
}
