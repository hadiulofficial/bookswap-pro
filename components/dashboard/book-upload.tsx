"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { v4 as uuidv4 } from "uuid"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, BookOpen } from "lucide-react"

interface BookUploadProps {
  onImageUploaded: (url: string) => void
  existingImageUrl?: string | null
  value?: string
  onChange?: (value: string) => void
}

export function BookUpload({ onImageUploaded, existingImageUrl, value, onChange }: BookUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage.from("book-covers").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("book-covers").getPublicUrl(filePath)

      // Update form value
      if (onChange) {
        onChange(publicUrl)
      }

      // Notify parent component
      onImageUploaded(publicUrl)
    } catch (error: any) {
      console.error("Error uploading image:", error)
      setUploadError(error.message || "Failed to upload image")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    if (onChange) {
      onChange("")
    }
    onImageUploaded("")
  }

  return (
    <div className="space-y-4">
      {previewUrl ? (
        <div className="relative aspect-[2/3] max-w-[200px] overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
          <Image
            src={previewUrl || "/placeholder.svg"}
            alt="Book cover preview"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 200px"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      ) : (
        <div className="flex aspect-[2/3] max-w-[200px] flex-col items-center justify-center rounded-md border border-dashed border-gray-200 p-4 dark:border-gray-800">
          <BookOpen className="mb-2 h-8 w-8 text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400">No cover image</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cover-image" className="sr-only">
          Upload Cover Image
        </Label>
        <div className="flex items-center gap-2">
          <Input
            id="cover-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("cover-image")?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload Cover
              </>
            )}
          </Button>
        </div>
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
      </div>
    </div>
  )
}
