

'use client';

import { useState, useCallback } from 'react';
import { useSession } from "next-auth/react";
import useSWR, { mutate } from 'swr';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Sparkles, History, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import { MealPhotoLogger } from './components/meal-photo-logger';
import { ManualMealLogger } from './components/manual-meal-logger';
import { PCOSFriendlyScore } from './components/pcos-friendly-score';
import { AnalysisDetails } from './components/analysis-details';
import type { AnalyzeMealPhotoOutput } from '@/ai/flows/ai-nutrition-scoring';

export type AnalysisResult = AnalyzeMealPhotoOutput | null;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const MealHistory = ({ meals, isLoading, onDelete }: { meals: any[], isLoading: boolean, onDelete: (id: string) => void }) => {
    if (isLoading) {
        return (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (!meals || meals.length === 0) {
        return (
            <div className="text-center p-12 text-muted-foreground glass-card mt-4">
                <p>No meals logged yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pt-4">
            {meals.map((meal) => (
                <Card key={meal.id} className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-bold">
                            {meal.mealName}
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(meal.id)}>
                            <Trash2 className="size-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p><span className="font-semibold text-foreground">Items:</span> {meal.foodItems}</p>
                                <p className="text-xs">{format(new Date(meal.loggedAt), 'PPP p')}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{meal.pcosScore}/10</div>
                                <div className="text-xs text-muted-foreground">PCOS Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default function NutritionPage() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
    const [mealPhoto, setMealPhoto] = useState<string | null>(null);
    const [manualMealDetails, setManualMealDetails] = useState<{ mealName: string, foodItems: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { data: session } = useSession();
    const user = session?.user;
    const { toast } = useToast();

    const { data: historyData, mutate: mutateHistory, isLoading: isHistoryLoading } = useSWR(
        user ? `/api/nutrition?userId=${user.id}` : null, // Note: API updated to use session, but SWR key needs user presence
        fetcher
    );
    const meals = historyData?.data || [];


    const handleAnalysisComplete = useCallback((result: AnalysisResult, mealDetails?: any) => {
        setAnalysisResult(result);
        if (mealDetails) {
            setManualMealDetails(mealDetails);
        }
        setIsLoading(false);
    }, []);

    const handleAnalysisStart = useCallback(() => {
        setIsLoading(true);
        setAnalysisResult(null);
        setMealPhoto(null);
        setManualMealDetails(null);
    }, []);

    const handleClear = useCallback(() => {
        setAnalysisResult(null);
        setMealPhoto(null);
        setManualMealDetails(null);
        setIsLoading(false);
    }, []);

    const handleSaveLog = useCallback(async () => {
        if (!user || !analysisResult) {
            toast({
                variant: "destructive",
                title: "Cannot Save",
                description: "User not logged in or no analysis result available."
            });
            return;
        }
        setIsSaving(true);

        const mealName = manualMealDetails?.mealName || "Quick Snap Meal";
        const foodItems = manualMealDetails?.foodItems || analysisResult.warnings?.join(", ") || "Analyzed Meal"; // Fallback for description

        try {
            const res = await fetch('/api/nutrition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // userId is handled by session in API, but previously sent in body. 
                    // We'll trust the API to use session.
                    mealName: mealName,
                    foodItems: foodItems,
                    pcosScore: analysisResult.score,
                    photoURL: mealPhoto,
                    loggedAt: new Date().toISOString()
                })
            });

            if (!res.ok) throw new Error("Failed to save");

            toast({
                title: "Meal Logged!",
                description: "Your nutritional analysis has been saved to your journal."
            });
            handleClear();
            mutateHistory();

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save your meal log. Please try again."
            });
        } finally {
            setIsSaving(false);
        }
    }, [user, analysisResult, manualMealDetails, mealPhoto, toast, handleClear, mutateHistory]);

    const handleDeleteMeal = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Delete failed");

            toast({ title: "Meal Deleted", description: "Entry removed from history." });
            mutateHistory();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete meal." });
        }
    }, [mutateHistory, toast]);

    return (
        <div className="p-4 md:p-8 space-y-4">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-headline font-bold text-gradient">Nutrition Hub</h1>
            </header>

            <Tabs defaultValue="ai-snap" className="w-full" onValueChange={handleClear}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ai-snap"><Sparkles className="mr-2 size-4" />AI Snap</TabsTrigger>
                    <TabsTrigger value="manual"><Edit className="mr-2 size-4" />Log</TabsTrigger>
                    <TabsTrigger value="history"><History className="mr-2 size-4" />History</TabsTrigger>
                </TabsList>

                <TabsContent value="ai-snap">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                        <MealPhotoLogger
                            onAnalysisComplete={handleAnalysisComplete}
                            onAnalysisStart={handleAnalysisStart}
                            onClear={handleClear}
                            isLoading={isLoading}
                            mealPhoto={mealPhoto}
                            setMealPhoto={setMealPhoto}
                        />
                        <aside className="space-y-6">
                            <PCOSFriendlyScore result={analysisResult} onSave={handleSaveLog} isSaving={isSaving} hasData={!!mealPhoto} />
                            <AnalysisDetails result={analysisResult} />
                        </aside>
                    </div>
                </TabsContent>

                <TabsContent value="manual">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                        <ManualMealLogger
                            onAnalysisComplete={handleAnalysisComplete}
                            onAnalysisStart={handleAnalysisStart}
                            onClear={handleClear}
                            isLoading={isLoading}
                        />
                        <aside className="space-y-6">
                            <PCOSFriendlyScore result={analysisResult} onSave={handleSaveLog} isSaving={isSaving} hasData={!!manualMealDetails} />
                            <AnalysisDetails result={analysisResult} />
                        </aside>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="max-w-2xl mx-auto">
                        <MealHistory meals={meals} isLoading={isHistoryLoading} onDelete={handleDeleteMeal} />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
