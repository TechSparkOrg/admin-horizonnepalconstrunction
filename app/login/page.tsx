"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Building2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "./validation";
import { useAuthStore } from "@/app/store/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-fs-bg4 via-white to-fs-bg4/50 p-4 sm:p-6">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10 flex flex-col items-center space-y-3">
          <div className="relative">
            <div className="absolute inset-0 bg-fs-secondary/10 rounded-2xl blur-xl" />
            <div className="relative bg-white rounded-2xl p-3 shadow-sm border border-fs-border3/10">
              <Building2 className="w-8 h-8 text-fs-secondary" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-fs-text1">
              Construction Admin
            </h1>
            <p className="text-sm text-fs-text3">Sign in to your dashboard</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-fs-border3/5 border border-fs-border3/10 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm p-3 text-center">
                {errors.root.message}
              </div>
            )}

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-fs-text2">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fs-text3/60 w-[18px] h-[18px] transition-colors group-focus-within:text-fs-secondary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register("email")}
                  className="pl-11 h-11 bg-fs-bg4/50 border-fs-border3/20 rounded-xl text-sm placeholder:text-fs-text3/40 focus:border-fs-secondary focus:ring-2 focus:ring-fs-secondary/10 transition-all duration-200"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-fs-text2">
                  Password
                </Label>
                <a href="#" className="text-xs font-medium text-fs-secondary hover:text-fs-btn1 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fs-text3/60 w-[18px] h-[18px] transition-colors group-focus-within:text-fs-secondary" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className="pl-11 h-11 bg-fs-bg4/50 border-fs-border3/20 rounded-xl text-sm placeholder:text-fs-text3/40 focus:border-fs-secondary focus:ring-2 focus:ring-fs-secondary/10 transition-all duration-200"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-fs-secondary hover:bg-fs-btn1 disabled:opacity-60 text-white font-semibold rounded-xl shadow-md hover:shadow-lg shadow-fs-secondary/20 hover:shadow-fs-btn1/20 transition-all duration-300 text-sm group"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-fs-border3/10 text-center">
            <p className="text-xs text-fs-text3/70">
              Need help? Contact{" "}
              <a href="#" className="text-fs-secondary hover:text-fs-btn1 font-medium transition-colors">
                Support
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-fs-text3/50 mt-6">
          &copy; 2026 Construction Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
