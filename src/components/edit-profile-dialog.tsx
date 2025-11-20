"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, Image as ImageIcon, X } from "lucide-react"
import { api } from "@/lib/api"
import { useUserStore } from "@/lib/store"
import type { User } from "@/lib/types"
import Image from "next/image"

interface EditProfileDialogProps {
  user: User
  children: React.ReactNode
}

export function EditProfileDialog({ user, children }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { syncUserStats, walletAddress } = useUserStore()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file")
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }

      setAvatarFile(file)
      setError(null)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let finalAvatarUrl = avatarUrl.trim()

      // If user uploaded a file, we need to upload it to IPFS or a CDN
      // For now, we'll use a data URL (temporary solution)
      // In production, you'd want to upload to IPFS or your own CDN
      if (avatarFile && previewUrl) {
        // For now, we'll use the preview URL as-is
        // In production, upload to IPFS/CDN first
        finalAvatarUrl = previewUrl
      }

      if (!finalAvatarUrl) {
        throw new Error("Avatar URL is required")
      }

      // Validate URL format (or data URL)
      if (!finalAvatarUrl.startsWith("http") && !finalAvatarUrl.startsWith("data:image")) {
        throw new Error("Invalid avatar URL format")
      }

      await api.updateAvatar(walletAddress, finalAvatarUrl)

      // Sync user stats to update avatar in store
      await syncUserStats(walletAddress)

      setSuccess(true)

      // Close dialog after 1 second
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setPreviewUrl(null)
        setAvatarFile(null)
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Failed to update avatar")
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePreview = () => {
    setPreviewUrl(null)
    setAvatarFile(null)
    setAvatarUrl(user.avatar || "")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
          <DialogDescription>Upload a custom avatar or paste an image URL</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Avatar Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-lg border-4 border-background overflow-hidden bg-muted shrink-0">
              {previewUrl ? (
                <Image src={previewUrl} alt="Avatar preview" width={128} height={128} className="w-full h-full object-cover" />
              ) : (
                <Image
                  src={avatarUrl || user.avatar || "/placeholder.svg?height=128&width=128&query=user avatar"}
                  alt="Current avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {previewUrl && (
              <Button type="button" variant="outline" size="sm" onClick={handleRemovePreview}>
                <X className="w-4 h-4 mr-2" />
                Remove Preview
              </Button>
            )}
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="avatar-file">Upload Image</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="avatar-file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("avatar-file")?.click()}
                disabled={loading}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
          </div>

          {/* Or URL Input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* URL Input */}
          <div>
            <Label htmlFor="avatar-url">Image URL</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="avatar-url"
                type="url"
                placeholder="https://example.com/avatar.png"
                value={avatarUrl}
                onChange={(e) => {
                  setAvatarUrl(e.target.value)
                  setError(null)
                  setPreviewUrl(null)
                  setAvatarFile(null)
                }}
                disabled={loading}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  if (avatarUrl) {
                    setPreviewUrl(avatarUrl)
                  }
                }}
                disabled={loading || !avatarUrl}
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Paste an image URL to preview</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/50">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/50">
              <p className="text-sm text-accent">Avatar updated successfully!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || (!avatarUrl && !previewUrl)} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Avatar"
              )}
            </Button>
          </div>
        </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

