"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormValues } from "./validation";
import { useAuthStore } from "@/app/store/auth-store";

export function _Client() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);

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
      router.push("/dashboard");
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 sm:p-6">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-lg shadow-sidebar-primary/20">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Construction Admin</h1>
            <p className="text-sm text-gray-500 mt-0.5">Sign in to your dashboard</p>
          </div>
        </div>

        <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {errors.root && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm p-3 text-center">
                  {errors.root.message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start">
                    <Mail className="size-4 text-gray-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    {...register("email")}
                  />
                </InputGroup>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <InputGroup className="h-10">
                  <InputGroupAddon align="inline-start">
                    <Lock className="size-4 text-gray-400" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      tabIndex={-1}
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-sidebar-primary hover:bg-sidebar-primary/90 text-white font-medium rounded-lg text-sm shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-1.5 size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 Construction Admin. All rights reserved.
        </p>
      </div>
    </div>
  );
}
