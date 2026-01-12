"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { updateProfile } from "firebase/auth"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client" // Switch to Supabase
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"

interface EditProfileForm {
    displayName: string
    photoURL: string
}

export function EditProfileDialog() {
    const { user } = useAuth()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(user?.photoURL || null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Initialize Supabase Client
    const supabase = createClient()

    const { register, handleSubmit } = useForm<EditProfileForm>({
        defaultValues: {
            displayName: user?.displayName || "",
            photoURL: user?.photoURL || "",
        }
    })

    // Reset preview when dialog opens
    useEffect(() => {
        if (open) {
            setPreviewUrl(user?.photoURL || null)
            setSelectedFile(null)
        }
    }, [open, user])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            const objectUrl = URL.createObjectURL(file)
            setPreviewUrl(objectUrl)
        }
    }

    const clearSelection = () => {
        setSelectedFile(null)
        setPreviewUrl(user?.photoURL || null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const onSubmit = async (data: EditProfileForm) => {
        if (!user) return

        try {
            console.log("Starting profile update...")
            setIsLoading(true)
            let finalPhotoURL = data.photoURL

            // If a new file is selected, upload it
            if (selectedFile) {
                console.log("Uploading file to Supabase...")
                const timestamp = Date.now()
                // Sanitize filename
                const safeName = user.uid.replace(/[^a-zA-Z0-9]/g, '')
                const filePath = `${safeName}_${timestamp}.${selectedFile.name.split('.').pop()}`

                try {
                    const { data: uploadData, error: uploadError } = await supabase
                        .storage
                        .from('avatars')
                        .upload(filePath, selectedFile, {
                            cacheControl: '3600',
                            upsert: false
                        })

                    if (uploadError) throw uploadError

                    // Get Public URL
                    const { data: { publicUrl } } = supabase
                        .storage
                        .from('avatars')
                        .getPublicUrl(filePath)

                    finalPhotoURL = publicUrl
                    console.log("Got Supabase URL:", finalPhotoURL)

                } catch (uploadError: any) {
                    console.error("Supabase Upload failed:", uploadError)
                    toast.error(`Upload failed: ${uploadError?.message || 'Check if "avatars" bucket exists and is public in Supabase'}`)
                    setIsLoading(false)
                    return
                }
            }

            console.log("Updating auth profile...")
            await updateProfile(user, {
                displayName: data.displayName,
                photoURL: finalPhotoURL,
            })
            console.log("Auth profile updated.")

            toast.success("Profile updated successfully")
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error("Profile update error:", error)
            toast.error("Failed to update profile")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="md:ml-auto bg-neo-mint text-neo-black px-6 py-2 text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#bef264] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase">
                    Edit Profile
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-neo-white border-2 border-black shadow-neo">
                <DialogHeader>
                    <DialogTitle className="font-sirukota text-2xl font-bold">EDIT PROFILE</DialogTitle>
                    <DialogDescription className="font-mono font-bold text-muted-foreground">
                        Update your public citizen identity.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">

                    {/* Avatar Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="w-24 h-24 border-2 border-black shadow-sm">
                            <AvatarImage src={previewUrl || ''} className="object-cover" />
                            <AvatarFallback className="bg-neo-lemon font-bold text-2xl">
                                {user?.displayName?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neo-blue active:shadow-none active:translate-y-[2px]"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                {selectedFile ? "Change Photo" : "Upload Photo"}
                            </Button>
                            {selectedFile && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={clearSelection}
                                    className="border-2 border-transparent hover:bg-red-100 hover:text-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold bg-neo-lemon border-2 border-black px-2 py-0.5 shadow-sm inline-block">
                            DISPLAY NAME
                        </label>
                        <Input
                            {...register("displayName", { required: true })}
                            className="bg-white border-2 border-black"
                            placeholder="Citizen Name"
                        />
                    </div>

                    {/* Hidden URL input */}
                    <input type="hidden" {...register("photoURL")} />

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-neo-black text-white font-bold border-2 border-black shadow-neo hover:bg-neutral-800 active:shadow-none active:translate-y-[2px]"
                        >
                            {isLoading ? "SAVING..." : "SAVE CHANGES"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
