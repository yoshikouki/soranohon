"use client";

import Image from "next/image";
import { paths } from "@/lib/paths";
import { IllustrationPlanSchema } from "../types";
import { GenerateIllustrationButton } from "./generate-illustration-button";
import { SceneListDisplay } from "./scene-list-display";

interface PlanDisplayProps {
  plan: IllustrationPlanSchema;
  bookId: string;
}

export function PlanDisplay({ plan, bookId }: PlanDisplayProps) {
  const { theme, style, characters, scenes, keyVisual } = plan.plan;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-1">
          <h4 className="font-semibold text-md text-primary">テーマ</h4>
          <p className="text-lg">{theme.value}</p>
        </div>
        <div className="space-y-1">
          <h4 className="font-semibold text-md text-primary">スタイル</h4>
          <p className="text-lg">{style.value}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-foreground text-lg">
          登場人物{" "}
          <span className="text-muted-foreground text-sm">
            ({characters.children.length}人)
          </span>
        </h4>
        <div className="space-y-6">
          {characters.children.map((character) => (
            <div key={character.charaName.value} className="space-y-2 bg-background p-4">
              <h5 className="font-semibold text-foreground text-md">
                {character.charaName.value}
                <span className="font-normal text-muted-foreground text-sm">
                  {" "}
                  {character.charaAge.value}歳・{character.charaSex.value}
                </span>
              </h5>
              <div className="space-y-2 text-muted-foreground text-sm">
                <div className="space-y-1">
                  <p className="text-primary/70 text-xs">外見</p>
                  <p>{character.charaAppearance.value}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-primary/70 text-xs">説明</p>
                  <p>{character.charaDescription.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground text-lg">キービジュアル</h4>
          <GenerateIllustrationButton
            bookId={bookId}
            prompt={`${style.value}スタイルで、${keyVisual.keyVisualTitle.value}。場所: ${keyVisual.keyVisualLocation.value}、時間: ${keyVisual.keyVisualTime.value}、状況: ${keyVisual.keyVisualSituation.value}、カメラアングル: ${keyVisual.keyVisualCamera.value}、色・照明: ${keyVisual.keyVisualColorLighting.value}。${keyVisual.keyVisualNotes.value}`}
            label="キービジュアル生成"
          />
        </div>

        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg">
          <Image
            src={paths.images.books.keyVisual(bookId)}
            alt={keyVisual.keyVisualTitle.value}
            fill
            className="object-cover"
            onError={() => {
              const selector = `img[alt="${keyVisual.keyVisualTitle.value}"]`;
              const img = document.querySelector(selector);
              if (img && img instanceof HTMLImageElement) {
                img.style.display = "none";
              }
            }}
          />
        </div>

        <div className="space-y-4 bg-background p-4">
          <h5 className="font-semibold text-foreground text-md">
            {keyVisual.keyVisualTitle.value}
          </h5>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <p className="text-primary/70 text-xs">場所</p>
              <p className="text-sm">{keyVisual.keyVisualLocation.value}</p>
            </div>
            <div className="space-y-1">
              <p className="text-primary/70 text-xs">時間</p>
              <p className="text-sm">{keyVisual.keyVisualTime.value}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-primary/70 text-xs">登場キャラクター</p>
            <div className="space-y-2">
              {keyVisual.keyVisualCharacters.children.map((character) => (
                <div key={character.keyVisualCharaName.value} className="text-sm">
                  <span className="font-medium">{character.keyVisualCharaName.value}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    {character.keyVisualCharaEmotion.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-primary/70 text-xs">状況</p>
              <p className="text-sm">{keyVisual.keyVisualSituation.value}</p>
            </div>

            <div className="space-y-1">
              <p className="text-primary/70 text-xs">カメラアングル</p>
              <p className="text-sm">{keyVisual.keyVisualCamera.value}</p>
            </div>

            <div className="space-y-1">
              <p className="text-primary/70 text-xs">色・照明</p>
              <p className="text-sm">{keyVisual.keyVisualColorLighting.value}</p>
            </div>

            <div className="space-y-1">
              <p className="text-primary/70 text-xs">備考</p>
              <p className="text-sm">{keyVisual.keyVisualNotes.value}</p>
            </div>
          </div>
        </div>
      </div>

      <SceneListDisplay bookId={bookId} scenes={scenes.children} />
    </div>
  );
}
