"use client";

import Image from "next/image";
import { CopyImageButton } from "@/components/copy-image-button";
import { paths } from "@/lib/paths";
import { prompts } from "../prompts";
import { IllustrationPlanJSON } from "../types";
import { GenerateIllustrationButton } from "./generate-illustration-button";
import { PromptDisplayWithCopy } from "./prompt-display-with-copy";

interface SceneListDisplayProps {
  bookId: string;
  scenes: IllustrationPlanJSON["scenes"];
  style: string;
}

export function SceneListDisplay({ bookId, scenes, style }: SceneListDisplayProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-lg">
        シーン <span className="text-muted-foreground text-sm">({scenes.length}場面)</span>
      </h4>
      <div className="space-y-8">
        {scenes.map((scene) => (
          <div key={`scene-${scene.index}`} className="space-y-4 bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline">
                <span className="pr-2 font-semibold text-primary text-sm">#{scene.index}</span>
                <h5 className="font-semibold text-md">{scene.title}</h5>
              </div>
              <GenerateIllustrationButton
                bookId={bookId}
                type="scene"
                sceneId={`scene-${scene.index}`}
                label={`シーン${scene.index}画像生成`}
              />
            </div>

            <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg">
              <Image
                src={paths.images.books.scene(bookId, scene.index)}
                alt={`シーン${scene.index}: ${scene.title}`}
                fill
                className="cursor-pointer object-cover"
                unoptimized
                onClick={() =>
                  navigator.clipboard.writeText(paths.images.books.scene(bookId, scene.index))
                }
                onError={() => {
                  const selector = `img[alt="シーン${scene.index}: ${scene.title}"]`;
                  const img = document.querySelector(selector);
                  if (img && img instanceof HTMLImageElement) {
                    img.style.display = "none";
                  }
                }}
              />
              <div className="absolute top-2 right-2">
                <CopyImageButton
                  imageUrl={paths.images.books.scene(bookId, scene.index)}
                  onCopy={() => {}}
                >
                  <span className="text-xs">画像をコピー</span>
                </CopyImageButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <p className="text-primary/70 text-xs">場所</p>
                <p className="text-sm">{scene.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-primary/70 text-xs">時間</p>
                <p className="text-sm">{scene.time}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-primary/70 text-xs">登場キャラクター</p>
              <div className="space-y-2">
                {scene.characters.map((character) => (
                  <div key={`${scene.index}-${character.name}`} className="text-sm">
                    <span className="font-medium">{character.name}</span>
                    <span className="text-muted-foreground"> {character.emotion}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-primary/70 text-xs">状況</p>
                <p className="text-sm">{scene.situation}</p>
              </div>

              <div className="space-y-1">
                <p className="text-primary/70 text-xs">カメラアングル</p>
                <p className="text-sm">{scene.camera}</p>
              </div>

              <div className="space-y-1">
                <p className="text-primary/70 text-xs">色・照明</p>
                <p className="text-sm">{scene.colorLighting}</p>
              </div>

              <div className="space-y-1">
                <p className="text-primary/70 text-xs">備考</p>
                <p className="text-sm">{scene.notes}</p>
              </div>
            </div>

            <PromptDisplayWithCopy
              prompt={
                prompts.scene(scene, style).find((item) => item.type === "text")?.text || ""
              }
              title={`シーン${scene.index}生成プロンプト`}
              itemValue={`scene-${scene.index}-prompt`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
