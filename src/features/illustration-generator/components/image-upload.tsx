"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ImageType = "key-visual" | "character-design" | `scene-${number}`;

interface ImageUploadProps {
  bookId: string;
  imageType: ImageType;
  currentImagePath?: string;
  onUploadComplete?: (imagePath: string) => void;
}

export function ImageUpload({
  bookId,
  imageType,
  currentImagePath,
  onUploadComplete,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImagePath || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          await handleFileUpload(file);
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("imageType", imageType);

      try {
        const response = await fetch(`/books/${bookId}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("アップロードに失敗しました");
        }

        const data = await response.json();
        onUploadComplete?.(data.imagePath);
      } catch (error) {
        console.error("Upload error:", error);
        alert("アップロードに失敗しました");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setPreview(null);
  };

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed p-6 transition-colors",
        isDragging && "border-primary bg-primary/5",
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onPaste={handlePaste}
    >
      {preview ? (
        <div className="relative">
          <Image
            src={preview}
            alt="Preview"
            width={400}
            height={300}
            className="h-auto max-h-64 w-full object-contain"
          />
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2"
            onClick={clearImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="cursor-pointer">
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              ドラッグ&ドロップ、クリップボードから貼り付け、またはクリックして画像を選択
            </p>
          </div>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <p className="text-sm">アップロード中...</p>
        </div>
      )}
    </Card>
  );
}
