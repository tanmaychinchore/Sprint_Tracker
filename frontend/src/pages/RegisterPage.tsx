import { useState, useCallback, useEffect } from "react";
import { Zap, CheckCircle2, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { RegisterForm } from "@/components/register/RegisterForm";
import type { RegisterFormData } from "@/types/auth";
import { API_BASE } from "@/lib/api";

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [isInviting, setIsInviting] = useState(false);
  
  const navigate = useNavigate();
  const { inviteToken } = useParams<{ inviteToken: string }>();

  // Fetch invitation details if token is present
  useEffect(() => {
    if (inviteToken) {
      const fetchInvite = async () => {
        try {
          setIsInviting(true);
          const response = await fetch(`${API_BASE}/teams/invite/${inviteToken}`);
          if (response.ok) {
            const data = await response.json();
            setInvitation(data);
          }
        } catch {} finally {
          setIsInviting(false);
        }
      };
      fetchInvite();
    }
  }, [inviteToken]);

  const handleRegister = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.headers.get("content-type")?.includes("application/json")) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.error || "Failed to register. Please try again.");
        } else {
          throw new Error("Unable to connect to the backend server. Is it running?");
        }
      }

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError("Something went wrong. Please check your connection.");
      }
      setIsLoading(false);
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <Card className="border-border bg-card shadow-xl relative overflow-hidden">
        
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-10 bg-card/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mb-4 animate-scale-in">
              <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Account created!</h3>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the login page...
            </p>
          </div>
        )}

        <CardHeader className="items-center text-center space-y-3 pt-8 pb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-md shadow-primary/20 mb-2 animate-fade-in">
            <Zap className="h-6 w-6 text-white" />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Create an account
            </CardTitle>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardDescription className="text-muted-foreground text-[13px]">
              Start tracking your agile projects today
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent
          className="animate-slide-up px-7"
          style={{ animationDelay: "0.3s" }}
        >
          {isInviting ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground animate-pulse">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-xs">Validating invitation...</p>
            </div>
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              isLoading={isLoading}
              apiError={apiError}
              invitation={invitation}
              initialInviteToken={inviteToken}
            />
          )}
        </CardContent>

        <CardFooter
          className="justify-center pb-8 animate-fade-in z-0 relative"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors duration-200"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
