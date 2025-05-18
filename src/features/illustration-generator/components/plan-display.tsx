"use client";

import { Loader2Icon, PaintbrushIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { Book } from "@/books";
import { CopyButton } from "@/components/copy-button";
import { CopyImageButton } from "@/components/copy-image-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { paths } from "@/lib/paths";
import { prompts } from "../prompts";
import { IllustrationPlanJSON } from "../types";
import { GenerateIllustrationButton } from "./generate-illustration-button";
import { ImageUpload } from "./image-upload";
import { PromptDisplayWithCopy } from "./prompt-display-with-copy";
import { SceneListDisplay } from "./scene-list-display";

type BookInfo = Pick<
  Book,
  "id" | "title" | "creator" | "translator" | "bibliographyRaw" | "aozoraBunkoUrl"
>;

interface PlanDisplayProps {
  plan: IllustrationPlanJSON;
  bookId: string;
  book: BookInfo;
  fullPlan: { plan: IllustrationPlanJSON | null; rawPlan: string };
}

export function PlanDisplay({ plan, bookId, book, fullPlan }: PlanDisplayProps) {
  const { theme, style, characters, scenes, keyVisual } = plan;
  const [isGeneratingDesign, setIsGeneratingDesign] = useState(false);
  const [generatedDesignPath, setGeneratedDesignPath] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingDesign = async () => {
      try {
        const designPath = paths.images.books.characterDesign(bookId);
        const response = await fetch(designPath, { method: "HEAD" });
        if (response.ok) {
          setGeneratedDesignPath(designPath);
        }
      } catch {
        // Design doesn't exist, which is fine
      }
    };
    checkExistingDesign();
  }, [bookId]);

  const characterDesignPrompt =
    prompts
      .characterDesign({
        plan: { ...fullPlan, bookId: bookId },
        book: { ...book, mdx: () => Promise.resolve({}) },
      })
      .find((item) => item.type === "text")?.text || "";

  const keyVisualPrompt =
    prompts
      .keyVisual({
        plan: { ...fullPlan, bookId: bookId },
        book: { ...book, mdx: () => Promise.resolve({}) },
      })
      .find((item) => item.type === "text")?.text || "";

  const handleGenerateDesign = async () => {
    setIsGeneratingDesign(true);
    try {
      const response = await fetch(`/books/${bookId}/illustrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "character-design" }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate character design");
      }

      const data = await response.json();
      setGeneratedDesignPath(data.imagePath);
    } catch (error) {
      logger.error("Failed to generate character design", { error });
    } finally {
      setIsGeneratingDesign(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-1">
          <h4 className="font-semibold text-md text-primary">テーマ</h4>
          <p className="text-lg">{theme}</p>
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-md text-primary">スタイル</h4>
          <p className="text-lg">{style}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-lg">キャラクターデザイン</h4>
          <div className="flex items-center gap-2">
            <CopyButton value={characterDesignPrompt} className="h-8 px-3 text-sm">
              <span className="text-xs">プロンプトコピー</span>
            </CopyButton>
            {generatedDesignPath && (
              <CopyImageButton
                imageUrl={generatedDesignPath}
                onCopy={() => {}}
                className="h-8 px-3 text-sm"
              >
                <span className="text-xs">画像コピー</span>
              </CopyImageButton>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateDesign}
              disabled={isGeneratingDesign}
            >
              {isGeneratingDesign ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <PaintbrushIcon className="mr-2 h-4 w-4" />
                  デザイン生成
                </>
              )}
            </Button>
          </div>
        </div>

        <ImageUpload
          bookId={bookId}
          imageType="character-design"
          currentImagePath={generatedDesignPath || paths.images.books.characterDesign(bookId)}
          onUploadComplete={(newPath) => {
            setGeneratedDesignPath(newPath);
          }}
        />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="prompt">
            <AccordionTrigger>プロンプト</AccordionTrigger>
            <AccordionContent>
              <PromptDisplayWithCopy
                prompt={characterDesignPrompt}
                title="キャラクターデザイン生成プロンプト"
                itemValue="character-design-prompt"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="plan">
            <AccordionTrigger>計画の詳細</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {characters.map((character) => (
                  <div key={character.name} className="space-y-2 bg-background p-4">
                    <h5 className="font-semibold text-foreground text-md">
                      {character.name}
                      <span className="font-normal text-muted-foreground text-sm">
                        {" "}
                        {character.age}歳・{character.sex}
                      </span>
                    </h5>
                    <div className="space-y-2 text-muted-foreground text-sm">
                      <div className="space-y-1">
                        <p className="text-primary/70 text-xs">外見</p>
                        <p>{character.appearance}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-primary/70 text-xs">説明</p>
                        <p>{character.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-lg">キービジュアル</h4>
          <div className="flex items-center gap-2">
            <CopyButton value={keyVisualPrompt} className="h-8 px-3 text-sm">
              <span className="text-xs">プロンプトコピー</span>
            </CopyButton>
            <CopyImageButton
              imageUrl={paths.images.books.keyVisual(bookId)}
              onCopy={() => {}}
              className="h-8 px-3 text-sm"
            >
              <span className="text-xs">画像コピー</span>
            </CopyImageButton>
            <GenerateIllustrationButton
              bookId={bookId}
              type="key-visual"
              label="キービジュアル生成"
            />
          </div>
        </div>

        <ImageUpload
          bookId={bookId}
          imageType="key-visual"
          currentImagePath={paths.images.books.keyVisual(bookId)}
        />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="prompt">
            <AccordionTrigger>プロンプト</AccordionTrigger>
            <AccordionContent>
              <PromptDisplayWithCopy
                prompt={keyVisualPrompt}
                title="キービジュアル生成プロンプト"
                itemValue="key-visual-prompt"
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="plan">
            <AccordionTrigger>計画の詳細</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 bg-background p-4">
                <h5 className="font-semibold text-foreground text-md">{keyVisual.title}</h5>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <p className="text-primary/70 text-xs">場所</p>
                    <p className="text-sm">{keyVisual.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-primary/70 text-xs">時間</p>
                    <p className="text-sm">{keyVisual.time}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-primary/70 text-xs">登場キャラクター</p>
                  <div className="space-y-2">
                    {keyVisual.characters.map((character) => (
                      <div key={character.name} className="text-sm">
                        <span className="font-medium">{character.name}</span>
                        <span className="text-muted-foreground"> {character.emotion}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-primary/70 text-xs">状況</p>
                    <p className="text-sm">{keyVisual.situation}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-primary/70 text-xs">カメラアングル</p>
                    <p className="text-sm">{keyVisual.camera}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-primary/70 text-xs">色・照明</p>
                    <p className="text-sm">{keyVisual.colorLighting}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-primary/70 text-xs">備考</p>
                    <p className="text-sm">{keyVisual.notes}</p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <SceneListDisplay bookId={bookId} scenes={scenes} style={style} />
    </div>
  );
}
