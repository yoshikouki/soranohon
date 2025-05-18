"use client";

import Image from "next/image";
import { CopyButton } from "@/components/copy-button";
import { CopyImageButton } from "@/components/copy-image-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { paths } from "@/lib/paths";
import { prompts } from "../prompts";
import { IllustrationPlanJSON } from "../types";
import { GenerateIllustrationButton } from "./generate-illustration-button";
import { ImageUpload } from "./image-upload";
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
              <div className="flex items-center gap-2">
                <CopyButton
                  value={
                    prompts.scene(scene, style).find((item) => item.type === "text")?.text || ""
                  }
                  className="h-8 px-3 text-sm"
                >
                  <span className="text-xs">プロンプトコピー</span>
                </CopyButton>
                <CopyImageButton
                  imageUrl={paths.images.books.scene(bookId, scene.index)}
                  onCopy={() => {}}
                  className="h-8 px-3 text-sm"
                >
                  <span className="text-xs">画像コピー</span>
                </CopyImageButton>
                <GenerateIllustrationButton
                  bookId={bookId}
                  type="scene"
                  sceneId={`scene-${scene.index}`}
                  label={`シーン${scene.index}画像生成`}
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
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
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-lg bg-background/80 p-4 backdrop-blur-sm">
                    <ImageUpload
                      bookId={bookId}
                      imageType={`scene-${scene.index}` as `scene-${number}`}
                      currentImagePath={paths.images.books.scene(bookId, scene.index)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="prompt">
                <AccordionTrigger>プロンプト</AccordionTrigger>
                <AccordionContent>
                  <PromptDisplayWithCopy
                    prompt={
                      prompts.scene(scene, style).find((item) => item.type === "text")?.text ||
                      ""
                    }
                    title={`シーン${scene.index}生成プロンプト`}
                    itemValue={`scene-${scene.index}-prompt`}
                  />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="plan">
                <AccordionTrigger>計画の詳細</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 bg-background p-4">
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
