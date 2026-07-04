"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

const editSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  relationshipStatus: z.string().optional(),
  avatarUrl: z.string().optional(),
  coverUrl: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function ProfileEditPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const [coverUploading, setCoverUploading] = React.useState(false);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

  const avatarUrl = watch("avatarUrl");
  const coverUrl = watch("coverUrl");

  React.useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (data) {
          reset({
            fullName: data.full_name || '',
            bio: data.bio || '',
            occupation: data.occupation || '',
            education: data.education || '',
            relationshipStatus: data.relationship_status || '',
            avatarUrl: data.avatar_url || '',
            coverUrl: data.cover_url || '',
          });
        }
      }
      setInitialLoad(false);
    }
    loadProfile();
  }, [reset]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      const file = event.target.files[0];
      
      if (type === 'avatar') setAvatarUploading(true);
      else setCoverUploading(true);

      // Compress image
      const options = {
        maxSizeMB: 0.1, // 100kb
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);

      const fileExt = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, compressedFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

      if (type === 'avatar') {
        setValue('avatarUrl', publicUrl);
      } else {
        setValue('coverUrl', publicUrl);
      }
      
      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Cover photo'} uploaded successfully!`);
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      if (type === 'avatar') setAvatarUploading(false);
      else setCoverUploading(false);
    }
  };

  async function onSubmit(data: EditFormValues) {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          bio: data.bio,
          occupation: data.occupation,
          education: data.education,
          relationship_status: data.relationshipStatus,
          avatar_url: data.avatarUrl,
          cover_url: data.coverUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile updated successfully!");
      }
    }
    setIsLoading(false);
  }

  if (initialLoad) return <div className="p-8 text-center flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading profile...</div>;

  return (
    <div className="flex flex-col max-w-3xl mx-auto p-4 space-y-6 animate-in fade-in pb-20">
      <Card className="border-none shadow-lg bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          
          <div className="mb-8 space-y-6">
            {/* Cover Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Photo</label>
              <div className="relative h-48 w-full rounded-xl overflow-hidden bg-[var(--foreground)]/5 border-2 border-dashed border-[var(--foreground)]/20 flex flex-col items-center justify-center group cursor-pointer">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-[var(--foreground)]/50 flex flex-col items-center">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span>Upload Cover Photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {coverUploading ? <Loader2 className="w-8 h-8 text-white animate-spin" /> : <Camera className="w-8 h-8 text-white" />}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleImageUpload(e, 'cover')}
                  disabled={coverUploading}
                />
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="space-y-2 flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-[var(--foreground)]/5 border-4 border-[var(--background)] shadow-lg group cursor-pointer">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/50">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleImageUpload(e, 'avatar')}
                  disabled={avatarUploading}
                />
              </div>
              <div className="mt-4 sm:mt-0 flex flex-col justify-center text-center sm:text-left">
                <p className="font-medium">Profile Picture</p>
                <p className="text-sm text-[var(--foreground)]/60">Click on the image to upload a new one.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="Your Name" {...register("fullName")} className="bg-white/50 dark:bg-[#0F172A]/50" />
              {errors.fullName && <p className="text-sm text-[var(--danger)]">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea 
                placeholder="Tell us about yourself..." 
                {...register("bio")}
                className="flex min-h-[100px] w-full rounded-md border border-[var(--foreground)]/20 bg-white/50 dark:bg-[#0F172A]/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.bio && <p className="text-sm text-[var(--danger)]">{errors.bio.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Occupation</label>
                <Input placeholder="Software Engineer" {...register("occupation")} className="bg-white/50 dark:bg-[#0F172A]/50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Education</label>
                <Input placeholder="University Name" {...register("education")} className="bg-white/50 dark:bg-[#0F172A]/50" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship Status</label>
                <select 
                  {...register("relationshipStatus")}
                  className="flex h-10 w-full rounded-md border border-[var(--foreground)]/20 bg-white/50 dark:bg-[#0F172A]/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="In a relationship">In a relationship</option>
                  <option value="Married">Married</option>
                  <option value="Complicated">It's complicated</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto px-8 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-[var(--primary)] text-[var(--primary-foreground)]">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Saving...</> : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
