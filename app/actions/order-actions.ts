"use server"

import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase/server"
import Stripe from "stripe"

// Initialize Stripe with the API key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
})

export type ShippingDetails = {
  fullName: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export async function createOrder(
  userId: string,
  bookId: string,
  sellerId: string,
  amount: number,
  shippingDetails: ShippingDetails,
) {
  try {
    // Create a new order in the database
    const orderId = uuidv4()

    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      user_id: userId,
      book_id: bookId,
      seller_id: sellerId,
      amount: amount,
      status: "pending",
    })

    if (orderError) {
      console.error("Error creating order:", orderError)
      return { success: false, error: "Failed to create order" }
    }

    // Store shipping details
    const { error: shippingError } = await supabase.from("shipping_details").insert({
      order_id: orderId,
      full_name: shippingDetails.fullName,
      address_line1: shippingDetails.addressLine1,
      address_line2: shippingDetails.addressLine2 || null,
      city: shippingDetails.city,
      state: shippingDetails.state,
      postal_code: shippingDetails.postalCode,
      country: shippingDetails.country,
      phone: shippingDetails.phone || null,
    })

    if (shippingError) {
      console.error("Error storing shipping details:", shippingError)
      return { success: false, error: "Failed to store shipping details" }
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Book Purchase", // We'll update this with actual book title in a real implementation
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/purchases/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/books/${bookId}`,
      metadata: {
        order_id: orderId,
        book_id: bookId,
      },
    })

    // Update the order with the Stripe session ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order with session ID:", updateError)
      // We'll continue anyway since the order is created
    }

    return {
      success: true,
      orderId,
      checkoutUrl: session.url,
    }
  } catch (error) {
    console.error("Error in createOrder:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      books (*),
      shipping_details (*)
    `)
    .eq("id", orderId)
    .single()

  if (error) {
    console.error("Error fetching order:", error)
    return { success: false, error: "Failed to fetch order" }
  }

  return { success: true, order: data }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)

  if (error) {
    console.error("Error updating order status:", error)
    return { success: false, error: "Failed to update order status" }
  }

  return { success: true }
}

export async function getOrdersByBuyerId(userId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      books (*),
      shipping_details (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching buyer orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }

  return { success: true, orders: data }
}

export async function getOrdersBySellerId(sellerId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      books (*),
      shipping_details (*),
      buyer:user_id(id, email, profile:profiles(*))
    `)
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching seller orders:", error)
    return { success: false, error: "Failed to fetch orders" }
  }

  return { success: true, orders: data }
}
