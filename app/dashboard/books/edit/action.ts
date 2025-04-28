"use server"

import { updateBook as updateBookAction } from "@/app/actions/book-actions"

export async function updateBookFromEdit(bookId: string, data: any) {
  return updateBookAction(bookId, data)
}
