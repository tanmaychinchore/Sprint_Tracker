import { useState, useCallback } from "react";
import { Zap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LoginForm } from "@/components/login/LoginForm";
import type { LoginFormData, LoginResponse } from "@/types/auth";

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = useCallback(async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.headers.get("content-type")?.includes("application/json")) {
          const errorData: any = await response.json();
          throw new Error(errorData.message || errorData.error || "Invalid credentials");
        } else {
          throw new Error("Unable to connect to the backend server. Is it running?");
        }
      }

      const result: LoginResponse = await response.json();

      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <Card className="border-border bg-card shadow-xl">
        <CardHeader className="items-center text-center space-y-3 pt-8 pb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-md shadow-primary/20 mb-2 animate-fade-in">
            <Zap className="h-6 w-6 text-white" />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </CardTitle>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardDescription className="text-muted-foreground text-[13px]">
              Sign in to your Sprint Tracker account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent
          className="animate-slide-up px-7"
          style={{ animationDelay: "0.3s" }}
        >
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            apiError={apiError}
          />
        </CardContent>

        <CardFooter
          className="justify-center pb-8 animate-fade-in"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors duration-200"
              id="signup-link"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
