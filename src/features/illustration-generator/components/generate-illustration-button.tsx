"use client";

import { ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";
import { paths } from "@/lib/paths";

type GenerateIllustrationButtonProps = {
  bookId: string;
  type?: "key-visual" | "scene";
  sceneId?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null;
  size?: "default" | "sm" | "lg" | "icon" | null;
  className?: string;
};

export function GenerateIllustrationButton({
  bookId,
  type = "key-visual",
  sceneId,
  label = "画像生成",
  variant = "default",
  size = "sm",
  className = "",
}: GenerateIllustrationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateIllustration = async () => {
    // sceneIdがあればsceneタイプとして扱う
    const illustrationType = sceneId ? "scene" : type;

    setIsLoading(true);
    try {
      const response = await fetch(paths.books.illustrations(bookId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: illustrationType,
          sceneId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "画像生成中にエラーが発生しました");
      }

      const data = await response.json();
      logger.info("画像生成成功:", data);
      toast.success("画像を生成しました");

      // 生成された画像をページに反映するためにリロード
      window.location.reload();
    } catch (error) {
      logger.error("画像生成エラー:", error);
      toast.error(`画像生成に失敗しました: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-1 ${className}`}
      onClick={handleGenerateIllustration}
      disabled={isLoading}
    >
      <ImageIcon className="h-4 w-4" />
      {isLoading ? "生成中..." : label}
    </Button>
  );
}
