"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IllustrationPlan, IllustrationPlanRequest } from "../types/illustration-plan";

interface IllustrationPlanFormProps {
  bookId: string;
  generateAction: (
    request: IllustrationPlanRequest,
  ) => Promise<{ plan: IllustrationPlan | null; message: string }>;
}

export function IllustrationPlanForm({ bookId, generateAction }: IllustrationPlanFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<IllustrationPlan | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const result = await generateAction({
        bookId,
      });
      setPlan(result.plan);
    } catch (error) {
      console.error("Failed to generate illustration plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Button type="submit" className="w-full" disabled={isGenerating}>
          {isGenerating ? "生成中..." : "挿絵計画を生成"}
        </Button>
      </form>

      {plan && (
        <div className="mt-6">
          <h3 className="mb-2 font-semibold text-lg">生成された挿絵計画</h3>
          <div className="grid gap-4">
            {plan.scenes.map((scene) => (
              <Card key={scene.sceneId} className="p-4">
                <h4 className="font-medium">{scene.title}</h4>
                <p className="text-muted-foreground text-sm">{scene.description}</p>
                <p className="mt-2 text-muted-foreground text-xs">
                  MDX範囲: {scene.mdxStart} - {scene.mdxEnd}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
