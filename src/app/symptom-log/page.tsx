
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Lightbulb, Loader2, Star, Trash2, Mic, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, m } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from 'swr';
// import { suggestSymptomsFromText, AISuggestSymptomsOutput } from "@/ai/flows/ai-suggested-symptoms"; // TODO: Migrate AI

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const SymptomConstellation = ({ symptoms }: { symptoms: any[] }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const symptomPositions = useMemo(() => {
        if (!isClient || symptoms.length === 0) return [];
        return symptoms.map((symptom, index) => {
            const angle = (index / symptoms.length) * 2 * Math.PI + (symptom.severity * 0.1);
            const radius = 50 + Math.random() * 100;
            return {
                ...symptom,
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
            };
        });
    }, [symptoms, isClient]);

    return (
        <Card className="glass-card h-[600px] w-full flex items-center justify-center overflow-hidden">
            <CardContent className="w-full h-full p-0">
                <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-grid-slate-700/[0.05] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05]" style={{ maskImage: 'linear-gradient(to bottom, transparent, black, black, transparent)' }}></div>
                    <AnimatePresence>
                        {symptoms.length > 0 ? (
                            symptomPositions.map((symptom, i) => (
                                <m.div
                                    key={symptom.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: [0.5, 1, 0.5],
                                        scale: 1,
                                        translateX: symptom.x,
                                        translateY: symptom.y
                                    }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.1,
                                        repeat: Infinity,
                                        repeatType: 'mirror',
                                        ease: 'easeInOut'
                                    }}
                                    className="absolute group cursor-pointer"
                                >
                                    <Star
                                        className="text-primary transition-all duration-300"
                                        fill="currentColor"
                                        size={(symptom.severity || 1) * 8}
                                        style={{ filter: `brightness(${(symptom.severity / 5) * 1.5})` }}
                                    />
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-popover text-popover-foreground rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {symptom.symptomType} (Severity: {symptom.severity})
                                    </div>
                                </m.div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <h3 className="text-2xl font-headline text-gradient">Symptom Constellation™</h3>
                                <p>Log a symptom to see your universe.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
};

const SymptomTimeline = ({ symptoms, isLoading, onDelete }: { symptoms: any[], isLoading: boolean, onDelete: (id: string) => void }) => {

    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Today's Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : symptoms && symptoms.length > 0 ? (
                        <div className="space-y-4">
                            {symptoms.map((symptom) => (
                                <m.div
                                    key={symptom.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                    className="flex items-center gap-4 bg-black/20 p-3 rounded-lg"
                                >
                                    <div className="text-lg">{symptom.symptomType === 'Cramps' ? '💢' : symptom.symptomType === 'Mood Swings' ? '🎭' : symptom.symptomType === 'Fatigue' ? '😴' : symptom.symptomType === 'Acne' ? '✨' : symptom.symptomType === 'Bloating' ? '🎈' : '🤕'}</div>
                                    <div className="flex-1">
                                        <p className="font-bold">{symptom.symptomType}</p>
                                        <p className="text-xs text-muted-foreground">Severity: {symptom.severity}/5</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(symptom.id)}>
                                        <Trash2 className="size-4" />
                                    </Button>
                                </m.div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-muted-foreground">
                            <p>No symptoms logged on this date.</p>
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

const symptomsList = [
    { name: 'Fatigue', severity: 3, bodyZone: 'General' },
    { name: 'Bloating', severity: 4, bodyZone: 'Torso' },
    { name: 'Cramps', severity: 2, bodyZone: 'Pelvis' },
    { name: 'Acne', severity: 3, bodyZone: 'Face' },
    { name: 'Mood Swings', severity: 5, bodyZone: 'Head' },
    { name: 'Headache', severity: 2, bodyZone: 'Head' },
];

const SymptomQuickLog = ({ onLog }: { onLog: (symptom: any) => void }) => {
    return (
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Quick Log</CardTitle>
                <CardDescription>Tap to log a common symptom.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {symptomsList.map((symptom) => (
                    <Button
                        key={symptom.name}
                        variant="outline"
                        onClick={() => onLog(symptom)}
                    >
                        {symptom.name}
                    </Button>
                ))}
            </CardContent>
        </Card>
    );
};

const DateSelector = ({ date, setDate }: { date: Date | undefined, setDate: (date: Date | undefined) => void }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className="w-[280px] justify-start text-left font-normal glass-card-auth"
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass-card-auth">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(d) => d > new Date()}
                />
            </PopoverContent>
        </Popover>
    )
}

const AISymptomLogger = ({ onLog, symptomHistory }: { onLog: (symptom: any) => void, symptomHistory: any[] }) => {
    // Disabled AI for now
    return (
        <Card className="glass-card opacity-80">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary" /> AI Symptom Helper</CardTitle>
                <CardDescription>AI logging is currently being upgraded.</CardDescription>
            </CardHeader>
            <CardContent>
                <Badge variant="outline">Coming Soon</Badge>
            </CardContent>
        </Card>
    )
}

export default function SymptomLogPage() {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const { data: session } = useSession();
    const user = session?.user;
    const { toast } = useToast();

    useEffect(() => {
        setDate(new Date());
    }, []);

    const dateStr = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

    // Fetch symptoms for the selected date
    const { data: symptomsData, isLoading, mutate: mutateSymptoms } = useSWR(
        user ? `/api/symptoms?date=${dateStr}` : null,
        fetcher
    );
    const symptoms = symptomsData?.data || [];

    // Fetch history (last 7 days) if needed, reused endpoint or filter
    const { data: historyData } = useSWR(
        user ? `/api/symptoms?limit=20` : null,
        fetcher
    );
    const symptomHistory = historyData?.data || [];


    const handleLogSymptom = useCallback(async (symptomData: any) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not logged in',
                description: 'You must be logged in to log symptoms.',
            });
            return;
        }

        try {
            const res = await fetch('/api/symptoms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symptomType: symptomData.name,
                    severity: symptomData.severity,
                    bodyZone: symptomData.bodyZone,
                    date: date ? date.toISOString() : new Date().toISOString(),
                })
            });

            if (!res.ok) throw new Error("Failed to log");

            toast({
                title: 'Symptom Logged!',
                description: `${symptomData.name} has been added to your log.`,
            });
            mutateSymptoms(); // Refresh data
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Could not log symptom. Please try again.`
            });
        }
    }, [user, date, toast, mutateSymptoms]);

    const handleDeleteSymptom = useCallback(async (symptomId: string) => {
        if (!user) return;

        // Optimistic update could go here
        try {
            const res = await fetch(`/api/symptoms?id=${symptomId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error("Failed to delete");

            toast({
                title: 'Symptom Removed',
                description: 'The symptom has been removed from your log.',
            });
            mutateSymptoms();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: `Could not remove symptom. Please try again.`
            });
        }
    }, [user, toast, mutateSymptoms]);

    const handleDateChange = useCallback((newDate: Date | undefined) => {
        setDate(newDate);
    }, []);

    return (
        <div className="p-4 md:p-8 space-y-4">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-headline font-bold text-gradient">Symptom Tracking</h1>
                <DateSelector date={date} setDate={handleDateChange} />
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <main className="lg:col-span-2">
                    <SymptomConstellation symptoms={symptoms} />
                </main>

                <aside className="space-y-6">
                    <AISymptomLogger onLog={handleLogSymptom} symptomHistory={symptomHistory} />
                    <SymptomQuickLog onLog={handleLogSymptom} />
                    <SymptomTimeline symptoms={symptoms} isLoading={isLoading} onDelete={handleDeleteSymptom} />
                </aside>
            </div>
        </div>
    );
}
