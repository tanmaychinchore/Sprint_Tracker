import React, { useState, useCallback } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LoginFormData, FormErrors } from "@/types/auth";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  apiError: string | null;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 1) return "Password is required";
  return undefined;
}

export function LoginForm({ onSubmit, isLoading, apiError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isFormEmpty = !email.trim() || !password;

  const handleBlur = useCallback(
    (field: "email" | "password") => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (field === "email") {
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: validatePassword(password),
        }));
      }
    },
    [email, password]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) return;

    await onSubmit({ email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
      {/* API Error Banner */}
      {apiError && (
        <div
          className="animate-scale-in rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
          id="login-api-error"
        >
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
            {apiError}
          </p>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-foreground/80">
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) {
                setErrors((prev) => ({
                  ...prev,
                  email: validateEmail(e.target.value),
                }));
              }
            }}
            onBlur={() => handleBlur("email")}
            className="pl-10"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={!!errors.email && touched.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
        </div>
        {errors.email && touched.email && (
          <p
            id="email-error"
            className="animate-slide-up text-xs text-destructive mt-1 flex items-center gap-1"
          >
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="login-password" className="text-foreground/80">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) {
                setErrors((prev) => ({
                  ...prev,
                  password: validatePassword(e.target.value),
                }));
              }
            }}
            onBlur={() => handleBlur("password")}
            className="pl-10 pr-11"
            autoComplete="current-password"
            disabled={isLoading}
            aria-invalid={!!errors.password && touched.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/70 transition-colors duration-200"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
            id="toggle-password-visibility"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && touched.password && (
          <p
            id="password-error"
            className="animate-slide-up text-xs text-destructive mt-1 flex items-center gap-1"
          >
            {errors.password}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full mt-2 text-[15px] font-semibold tracking-wide"
        disabled={isFormEmpty || isLoading}
        id="login-submit-btn"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
