"use client";

import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MdxEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

const removeTags = (content: string | undefined) => {
  return content?.replace(/<rt>.*?<\/rt>/g, "").replace(/<.*?>/g, "") || "";
};

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

  const contentWithoutTags = removeTags(content);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-xl">MDXコンテンツ</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div>Contents:</div>
          <div>{content?.length.toLocaleString() || "0"}</div>
        </div>
        <div>
          <div>Contents without tags:</div>
          <div>{contentWithoutTags.length.toLocaleString() || "0"}</div>
        </div>
        <div className="col-span-2">
          <Textarea
            className="h-96 w-full resize-y font-mono"
            value={contentWithoutTags}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};
