"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const setupSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  city: z.string().min(1, { message: "City is required" }),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
  });

  async function onSubmit(data: SetupFormValues) {
    setIsLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("You must be logged in to setup your profile");
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        username: data.username,
        gender: data.gender,
        date_of_birth: data.dateOfBirth,
        country: data.country,
        city: data.city,
      })
      .eq('id', user.id);

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile setup complete!");
      router.push("/home");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[var(--background)]">
      <Card className="w-full max-w-2xl border-none shadow-2xl bg-white/5 dark:bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-lg">
            Let others know more about you to find better matches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input placeholder="John Doe" {...register("fullName")} className="bg-[var(--background)]" />
                {errors.fullName && <p className="text-sm text-[var(--danger)]">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input placeholder="johndoe123" {...register("username")} className="bg-[var(--background)]" />
                {errors.username && <p className="text-sm text-[var(--danger)]">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select 
                  {...register("gender")} 
                  className="flex h-10 w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-sm text-[var(--danger)]">{errors.gender.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <Input type="date" {...register("dateOfBirth")} className="bg-[var(--background)]" />
                {errors.dateOfBirth && <p className="text-sm text-[var(--danger)]">{errors.dateOfBirth.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input placeholder="India" {...register("country")} className="bg-[var(--background)]" />
                {errors.country && <p className="text-sm text-[var(--danger)]">{errors.country.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input placeholder="Mumbai" {...register("city")} className="bg-[var(--background)]" />
                {errors.city && <p className="text-sm text-[var(--danger)]">{errors.city.message}</p>}
              </div>
            </div>

            <Button className="w-full text-lg h-12 mt-6 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] border-none" type="submit" disabled={isLoading}>
              {isLoading ? "Saving Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
