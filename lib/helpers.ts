// This file contains helper functions for the BookSwap application
import { VALID_CONDITIONS, type Condition, type ListingType } from "@/lib/constants"

// Function to validate book condition
export function isValidCondition(condition: string): condition is Condition {
  return VALID_CONDITIONS.includes(condition as Condition)
}

// Function to format listing type for display
export function formatListingType(type: string): string {
  const formattedType = type.toLowerCase()
  if (formattedType === "swap") return "Exchange"
  return formattedType.charAt(0).toUpperCase() + formattedType.slice(1)
}

// Function to convert listing type to database format
export function normalizeListingType(type: string): ListingType {
  const normalized = type.toLowerCase()
  if (normalized === "exchange") return "Swap"
  if (normalized === "sale") return "Sale"
  if (normalized === "donation") return "Donation"
  return "Sale" // Default
}
