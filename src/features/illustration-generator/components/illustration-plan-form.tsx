"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { IllustrationPlan, IllustrationPlanRequest } from "../types/illustration-plan";

interface IllustrationPlanFormProps {
  bookId: string;
  generateAction: (request: IllustrationPlanRequest) => Promise<IllustrationPlan | null>;
}

export function IllustrationPlanForm({ bookId, generateAction }: IllustrationPlanFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneCount, setSceneCount] = useState<number>(10);
  const [stylePreference, setStylePreference] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [plan, setPlan] = useState<IllustrationPlan | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const request: IllustrationPlanRequest = {
        bookId,
        sceneCount,
        stylePreference,
        prompt,
      };

      const result = await generateAction(request);
      setPlan(result);
    } catch (error) {
      console.error("Failed to generate illustration plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sceneCount">シーン数</Label>
          <div className="flex items-center gap-4">
            <Slider
              id="sceneCount"
              min={1}
              max={20}
              step={1}
              value={[sceneCount]}
              onValueChange={(value) => setSceneCount(value[0])}
              className="flex-grow"
            />
            <span className="w-8 text-center">{sceneCount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="stylePreference">スタイル指定</Label>
          <Input
            id="stylePreference"
            placeholder="例: 日本画風、水彩画風、アニメ風"
            value={stylePreference}
            onChange={(e) => setStylePreference(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prompt">追加プロンプト</Label>
          <Textarea
            id="prompt"
            placeholder="特別な指示があれば入力してください"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-20"
          />
        </div>

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
