"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MdxEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

export const MdxEditor = ({ initialContent, onChange }: MdxEditorProps) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-xl">MDXコンテンツ編集</h2>
      <Textarea
        className="h-96 w-full resize-y font-mono"
        value={content}
        onChange={handleChange}
        placeholder="MDXコンテンツを編集..."
      />
    </div>
  );
};
