// lib/constants.ts
export const VALID_CONDITIONS = ["New", "Like New", "Very Good", "Good", "Acceptable"] as const

// Add any other constants your app needs here
export type Condition = (typeof VALID_CONDITIONS)[number]

export const LISTING_TYPES = ["Sale", "Swap", "Donation"] as const
export type ListingType = (typeof LISTING_TYPES)[number]
