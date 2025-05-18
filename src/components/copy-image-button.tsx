"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { logger } from "@/lib/logger";
import { cn } from "@/lib/utils";

interface CopyImageButtonProps {
  imageUrl: string;
  children?: React.ReactNode;
  onCopy?: () => void;
  writeImageToClipboard?: (imageBlob: Blob) => Promise<void>;
  fetchImage?: (url: string) => Promise<Response>;
  className?: string;
}

export function CopyImageButton({
  imageUrl,
  children,
  onCopy,
  writeImageToClipboard,
  fetchImage,
  className,
}: CopyImageButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = async () => {
    setIsLoading(true);
    try {
      const fetcher = fetchImage || fetch;
      const response = await fetcher(imageUrl);
      const blob = await response.blob();

      // Convert webp to png if needed
      let imageBlob = blob;
      if (blob.type === "image/webp") {
        const img = new Image();
        const url = URL.createObjectURL(blob);

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        imageBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, "image/png");
        });

        URL.revokeObjectURL(url);
      }

      const writer =
        writeImageToClipboard ||
        (async (blob) => {
          const item = new ClipboardItem({ [blob.type]: blob });
          await navigator.clipboard.write([item]);
        });
      await writer(imageBlob);

      setIsCopied(true);
      onCopy?.();
    } catch (error) {
      logger.error("Failed to copy image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center gap-2 rounded-md p-2 hover:bg-muted",
        className,
      )}
    >
      {isCopied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
      {children}
    </button>
  );
}
