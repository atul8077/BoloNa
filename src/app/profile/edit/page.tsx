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

const editSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  bio: z.string().max(500, { message: "Bio must be less than 500 characters" }).optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
  relationshipStatus: z.string().optional(),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function ProfileEditPage() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [initialLoad, setInitialLoad] = React.useState(true);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
  });

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
          });
        }
      }
      setInitialLoad(false);
    }
    loadProfile();
  }, [reset]);

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

  if (initialLoad) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="flex flex-col max-w-3xl mx-auto p-4 space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input placeholder="Your Name" {...register("fullName")} />
              {errors.fullName && <p className="text-sm text-[var(--danger)]">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea 
                placeholder="Tell us about yourself..." 
                {...register("bio")}
                className="flex min-h-[100px] w-full rounded-md border border-[var(--foreground)]/20 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {errors.bio && <p className="text-sm text-[var(--danger)]">{errors.bio.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Occupation</label>
                <Input placeholder="Software Engineer" {...register("occupation")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Education</label>
                <Input placeholder="University Name" {...register("education")} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship Status</label>
                <select 
                  {...register("relationshipStatus")}
                  className="flex h-10 w-full rounded-md border border-[var(--foreground)]/20 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto px-8">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
