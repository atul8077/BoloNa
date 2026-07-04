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
import Link from "next/link";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        }
      }
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration successful!");
      router.push("/home");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-[var(--secondary)]/20 to-[var(--primary)]/20">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)] mb-2 flex items-center justify-center text-white font-bold text-xl">
            B
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join BoloNa and start connecting today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Full Name"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-[var(--danger)]">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email address"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-[var(--danger)]">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-[var(--danger)]">{errors.password.message}</p>
              )}
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-[var(--foreground)]/70">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
              Sign in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
