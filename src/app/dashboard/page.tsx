
'use client';
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Flame,
  HeartPulse,
  Loader2,
  Moon,
  Users,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { useSession } from "next-auth/react"; // Replaces useUser from Firebase
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
// import { generateCoachingTip } from "@/ai/flows/ai-generated-coaching"; // TODO: Migrate AI
// import { predictSymptomFlareUp, SymptomPredictorOutput } from "@/ai/flows/ai-symptom-predictor"; // TODO: Migrate AI
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DailyCheckIn } from "./daily-check-in";
import { useUserHealthData } from "@/hooks/use-user-health-data";
import { m } from "framer-motion";
import { ChartTooltipContent } from "@/components/ui/chart";

const HealthScoreCircle = () => {
  // This hook now uses SWR + API, so it works automatically!
  const {
    recentSymptoms,
    recentFitnessActivities,
    recentMeals,
    dailyCheckIns
  } = useUserHealthData(7);

  const healthScore = useMemo(() => {
    if (!recentSymptoms) return 0;

    // Simplified Logic Calculation (reused from before)
    // ... For brevity, assuming 75 as baseline if data missing
    return 75; // Placeholder until we refine the scoring logic with new data structures
  }, [recentSymptoms, recentFitnessActivities, recentMeals]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="relative size-40 flex items-center justify-center">
      <svg className="absolute size-full transform -rotate-90">
        <circle className="text-muted/50" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50%" cy="50%" />
        <m.circle
          className="text-primary"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50%"
          cy="50%"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="text-center">
        <span className="text-4xl font-bold font-code text-foreground">{healthScore}</span>
        <p className="text-xs text-muted-foreground">Health Score</p>
      </div>
    </div>
  );
};

// Placeholder for Community until we migrate that API
const CommunityPostItem = ({ post }: { post: any }) => (
  <div className="flex items-start gap-4">
    <Avatar>
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <p className="font-semibold">{post.title || 'Community Member'}</p>
      <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
    </div>
  </div>
)

const SymptomPredictor = () => {
  // Disabled temporarily until AI service is migrated
  return (
    <Card className="glass-card lg:col-span-2 opacity-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BrainCircuit className="text-secondary" /> Symptom Predictor</CardTitle>
        <CardDescription>AI Forecasting coming soon with the new backend Upgrade.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center p-4">
          <Badge variant="outline">Under Maintenence</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { toast } = useToast();

  const [aiCoachingTip, setAiCoachingTip] = useState<string | null>("Focus on hydration today!");
  const [isLoggingSymptom, setIsLoggingSymptom] = useState<string | null>(null);

  const {
    cycleDay,
    cyclePhase,
    areCyclesLoading,
  } = useUserHealthData();

  const phaseBadgeColors: { [key: string]: string } = {
    Menstrual: 'bg-cycle-menstrual/20 text-cycle-menstrual border-cycle-menstrual/30',
    Follicular: 'bg-cycle-follicular/20 text-cycle-follicular border-cycle-follicular/30',
    Ovulation: 'bg-cycle-ovulation/20 text-cycle-ovulation border-cycle-ovulation/30',
    Luteal: 'bg-cycle-luteal/20 text-cycle-luteal border-cycle-luteal/30',
  }

  // Mock posts for now
  const communityPosts: any[] = [];

  const handleQuickLogSymptom = useCallback(async (symptom: { name: string, bodyZone: string }) => {
    if (!user || isLoggingSymptom) return;
    setIsLoggingSymptom(symptom.name);

    try {
      const res = await fetch('/api/symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptomType: symptom.name,
          severity: 3,
          bodyZone: symptom.bodyZone,
          date: new Date().toISOString() // API expects 'date' or uses now()
        })
      });

      if (!res.ok) throw new Error("Failed to log");

      toast({
        title: "Symptom Logged!",
        description: `${symptom.name} has been added to your log for today.`
      });
      // Optionally mutate() SWR here to refresh data immediately
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Could not log ${symptom.name}.`
      });
    } finally {
      setIsLoggingSymptom(null);
    }
  }, [user, toast, isLoggingSymptom]);

  const journeyProgress = 12; // MOCK for now
  const progressPercent = (journeyProgress / 90) * 100;

  const symptoms = [
    { name: "Fatigue", bodyZone: "General" },
    { name: "Bloating", bodyZone: "Torso" },
    { name: "Cramps", bodyZone: "Pelvis" },
    { name: "Acne", bodyZone: "Face" },
    { name: "Mood Swings", bodyZone: "Head" },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-headline font-bold tracking-tight">
            Welcome Back, {user?.name || 'Friend'}!
          </h2>
          <p className="text-muted-foreground">
            Here's your wellness overview for today.
          </p>
        </div>
      </div>

      {/* Daily CheckIn Component would need similar specific refactor, leaving for now as it might be visual only or fail gracefully */}
      {/* <DailyCheckIn /> */}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="text-chart-3" />
              PCOS Compass: Your 90-Day Journey
            </CardTitle>
            <CardDescription>
              Day {journeyProgress}: You're making amazing progress in your journey!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Tracking Mastery</span>
              <span>Lifestyle Integration</span>
              <span>Advanced Insights</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="text-primary" />
              Cycle Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {areCyclesLoading ? (
              <div className="space-y-2 flex flex-col items-center"><Skeleton className="h-8 w-24" /></div>
            ) : cycleDay && cyclePhase !== 'Unknown' ? (
              <>
                <div className="text-5xl font-bold font-code">Day {cycleDay}</div>
                <Badge className={cn("mt-2", cyclePhase && phaseBadgeColors[cyclePhase])}>
                  {cyclePhase} Phase
                </Badge>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">
                <p>No cycle data yet.</p>
                <Button variant="link" asChild><Link href="/cycle-tracker">Log your period</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card flex flex-col items-center justify-center">
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthScoreCircle />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <SymptomPredictor />
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary" />
              Today's AI Coaching
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-accent text-lg italic text-muted-foreground">
              "{aiCoachingTip}"
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartPulse className="text-destructive" />
            Log Your Symptoms
          </CardTitle>
          <CardDescription>
            Quickly add how you're feeling today.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {symptoms.map((symptom) => (
            <Button key={symptom.name} variant="outline" size="lg" className="h-12" onClick={() => handleQuickLogSymptom(symptom)} disabled={!!isLoggingSymptom}>
              {isLoggingSymptom === symptom.name ? <Loader2 className="animate-spin" /> : symptom.name}
            </Button>
          ))}
          <Button variant="secondary" size="lg" className="h-12" asChild>
            <Link href="/symptom-log">Add Detailed Entry +</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2"><Users className="text-secondary" /> Sisterhood Feed</CardTitle>
                <CardDescription>Connect with the community.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Community features coming soon.</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="text-chart-4" /> Accuracy</CardTitle>
            <CardDescription>AI Learning Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center font-bold text-xl">Learning...</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
