import React, { useState, useCallback } from "react";
import { User, Mail, Lock, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RegisterFormData, FormErrors } from "@/types/auth";

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading: boolean;
  apiError: string | null;
}

function validateName(name: string): string | undefined {
  if (!name.trim()) return "Full name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return undefined;
}

function validateConfirmPassword(password: string, confirm: string): string | undefined {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return undefined;
}

export function RegisterForm({ onSubmit, isLoading, apiError }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isFormEmpty = !name.trim() || !email.trim() || !password || !confirmPassword;

  // Simple password strength calculator (0-4)
  const passwordStrength = Math.min(
    ((password.length >= 6) ? 1 : 0) +
    ((password.length >= 10) ? 1 : 0) +
    ((/[A-Z]/.test(password)) ? 1 : 0) +
    ((/[0-9]/.test(password)) ? 1 : 0),
    4
  );

  const strengthColor = 
    passwordStrength === 0 ? "bg-muted" :
    passwordStrength === 1 ? "bg-red-500" :
    passwordStrength === 2 ? "bg-amber-500" :
    passwordStrength === 3 ? "bg-green-400" :
    "bg-emerald-500";
    
  const strengthText =
    passwordStrength === 0 ? "" :
    passwordStrength === 1 ? "Weak" :
    passwordStrength === 2 ? "Fair" :
    passwordStrength === 3 ? "Good" :
    "Strong";

  const handleBlur = useCallback(
    (field: keyof FormErrors) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      
      switch (field) {
        case "name":
          setErrors(prev => ({ ...prev, name: validateName(name) }));
          break;
        case "email":
          setErrors(prev => ({ ...prev, email: validateEmail(email) }));
          break;
        case "password":
          setErrors(prev => ({ 
            ...prev, 
            password: validatePassword(password),
            // Re-validate confirm password if password changes
            confirmPassword: touched.confirmPassword ? validateConfirmPassword(password, confirmPassword) : prev.confirmPassword
          }));
          break;
        case "confirmPassword":
          setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(password, confirmPassword) }));
          break;
      }
    },
    [name, email, password, confirmPassword, touched.confirmPassword]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(password, confirmPassword);

    setErrors({ 
      name: nameError, 
      email: emailError, 
      password: passwordError,
      confirmPassword: confirmError
    });
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (nameError || emailError || passwordError || confirmError) return;

    await onSubmit({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
      {/* API Error Banner */}
      {apiError && (
        <div className="animate-scale-in rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
            {apiError}
          </p>
        </div>
      )}

      {/* Name Field */}
      <div className="space-y-1.5">
        <Label htmlFor="register-name" className="text-foreground/80">Full name</Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="register-name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (touched.name) setErrors(prev => ({ ...prev, name: validateName(e.target.value) }));
            }}
            onBlur={() => handleBlur("name")}
            className="pl-10"
            disabled={isLoading}
            aria-invalid={!!errors.name && touched.name}
          />
        </div>
        {errors.name && touched.name && (
          <p className="animate-slide-up text-[11px] text-destructive mt-1">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <Label htmlFor="register-email" className="text-foreground/80">Email address</Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
            }}
            onBlur={() => handleBlur("email")}
            className="pl-10"
            autoComplete="email"
            disabled={isLoading}
            aria-invalid={!!errors.email && touched.email}
          />
        </div>
        {errors.email && touched.email && (
          <p className="animate-slide-up text-[11px] text-destructive mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="register-password" className="text-foreground/80">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) {
                setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                if (touched.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(e.target.value, confirmPassword) }));
                }
              }
            }}
            onBlur={() => handleBlur("password")}
            className="pl-10 pr-11"
            disabled={isLoading}
            aria-invalid={!!errors.password && touched.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/70 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {password.length > 0 && !errors.password && (
            <div className="flex items-center gap-2 mt-2 animate-fade-in">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex">
                <div className={`h-full ${strengthColor} transition-all duration-300`} style={{ width: `${(passwordStrength / 4) * 100}%` }} />
              </div>
              <span className={`text-[10px] font-medium ${strengthColor.replace('bg-', 'text-')}`}>{strengthText}</span>
            </div>
        )}

        {errors.password && touched.password && (
          <p className="animate-slide-up text-[11px] text-destructive mt-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="register-confirm" className="text-foreground/80">Confirm password</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            id="register-confirm"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (touched.confirmPassword) {
                setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(password, e.target.value) }));
              }
            }}
            onBlur={() => handleBlur("confirmPassword")}
            className="pl-10 pr-11"
            disabled={isLoading}
            aria-invalid={!!errors.confirmPassword && touched.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/70 transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          
          {/* Match indicator */}
          {confirmPassword.length > 0 && !errors.confirmPassword && touched.confirmPassword && (
             <Check className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-scale-in" />
          )}
        </div>
        {errors.confirmPassword && touched.confirmPassword && (
          <p className="animate-slide-up text-[11px] text-destructive mt-1 flex items-center gap-1">
            <X className="h-3 w-3" /> {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full mt-4 text-[15px] font-semibold tracking-wide"
        disabled={isFormEmpty || isLoading || Object.values(errors).some(Boolean)}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
