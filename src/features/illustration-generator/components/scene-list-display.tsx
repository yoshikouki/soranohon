"use client";

import Image from "next/image";
import { filePaths } from "@/lib/file-paths";
import { SceneSchema } from "../types";
import { GenerateIllustrationButton } from "./generate-illustration-button";

interface SceneListDisplayProps {
  bookId: string;
  scenes: SceneSchema[];
}

export function SceneListDisplay({ bookId, scenes }: SceneListDisplayProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground text-lg">
        シーン <span className="text-muted-foreground text-sm">({scenes.length}場面)</span>
      </h4>
      <div className="space-y-8">
        {scenes.map((scene) => (
          <div key={`scene-${scene.sceneIndex.value}`} className="space-y-4 bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline">
                <span className="pr-2 font-semibold text-primary text-sm">
                  #{scene.sceneIndex.value}
                </span>
                <h5 className="font-semibold text-md">{scene.sceneTitle.value}</h5>
              </div>
              <GenerateIllustrationButton
                bookId={bookId}
                prompt={`シーン${scene.sceneIndex.value}: ${scene.sceneTitle.value}。場所: ${scene.sceneLocation.value}、時間: ${scene.sceneTime.value}、状況: ${scene.sceneSituation.value}、カメラアングル: ${scene.sceneCamera.value}、色・照明: ${scene.sceneColorLighting.value}。${scene.sceneNotes.value}`}
                sceneId={`scene-${scene.sceneIndex.value}`}
                label={`シーン${scene.sceneIndex.value}画像生成`}
              />
            </div>

            <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg">
              <Image
                src={filePaths.books.images.scene(bookId, scene.sceneIndex.value)}
                alt={`シーン${scene.sceneIndex.value}: ${scene.sceneTitle.value}`}
                fill
                className="object-cover"
                onError={() => {
                  // エラー時に表示するプレースホルダー画像を設定
                  const selector = `img[alt="シーン${scene.sceneIndex.value}: ${scene.sceneTitle.value}"]`;
                  const img = document.querySelector(selector);
                  if (img && img instanceof HTMLImageElement) {
                    img.style.display = "none";
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <p className="text-primary/70 text-xs">場所</p>
                <p className="text-sm">{scene.sceneLocation.value}</p>
              </div>
              <div className="space-y-1">
                <p className="text-primary/70 text-xs">時間</p>
                <p className="text-sm">{scene.sceneTime.value}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-primary/70 text-xs">登場キャラクター</p>
              <div className="space-y-2">
                {scene.sceneCharacters.children.map((character) => (
                  <div
                    key={`${scene.sceneIndex.value}-${character.sceneCharaName.value}`}
                    className="text-sm"
                  >
                    <span className="font-medium">{character.sceneCharaName.value}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      {character.sceneCharaEmotion.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-primary/70 text-xs">状況</p>
                <p className="text-sm">{scene.sceneSituation.value}</p>
              </div>

              <div className="space-y-1">
                <p className="text-primary/70 text-xs">カメラアングル</p>
                <p className="text-sm">{scene.sceneCamera.value}</p>
              </div>

              <div className="space-y-1">
                <p className="text-primary/70 text-xs">色・照明</p>
                <p className="text-sm">{scene.sceneColorLighting.value}</p>
              </div>

              <div className="space-y-1">
                <p className="text-primary/70 text-xs">備考</p>
                <p className="text-sm">{scene.sceneNotes.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
