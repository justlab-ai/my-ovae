
'use client';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Logo } from "@/components/logo";
import React, { useState } from "react";
import { LivingBackground } from "@/components/living-background";
import { m } from 'framer-motion';
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";
import { Loader2, Mail } from "lucide-react";

const GoogleIcon = () => (
  <svg className="size-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Could not connect to Google.",
      });
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid email or password.",
        });
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <main className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-background">
      <LivingBackground />

      <div className="w-full max-w-sm z-10">
        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "backOut" }}
          className="glass-card-auth rounded-3xl p-8 text-center flex flex-col items-center"
        >
          <Logo className="mb-2" />

          <p className="font-accent text-lg text-muted-foreground italic mb-6">
            Your Personalized PCOS Wellness Companion
          </p>

          <Button
            variant="outline"
            className="w-full h-12 text-base font-normal gap-2 border-muted-foreground/20 hover:bg-white/5"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </Button>

          <div className="w-full flex items-center gap-2 my-6">
            <Separator className="flex-1 bg-muted-foreground/20" />
            <span className="text-xs text-muted-foreground uppercase">Or continue with</span>
            <Separator className="flex-1 bg-muted-foreground/20" />
          </div>

          <form onSubmit={handleEmailLogin} className="w-full space-y-3 mb-6">
            <Input
              type="email"
              placeholder="Email Address"
              className="h-11 bg-white/5 border-white/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              className="h-11 bg-white/5 border-white/10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button className="w-full h-11" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth-test" className="text-primary hover:underline font-semibold">
              Sign up (Beta)
            </Link>
          </p>
        </m.div>
      </div>
    </main>
  );
}
