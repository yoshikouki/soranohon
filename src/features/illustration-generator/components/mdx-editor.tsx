import { Textarea } from "@/components/ui/textarea";

interface MdxEditorProps {
  contents: string;
  contentsWithoutTags: string;
  onChange?: (content: string) => void;
}

export const MdxEditor = ({ contents, contentsWithoutTags }: MdxEditorProps) => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-xl">MDXコンテンツ</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div>Contents:</div>
          <div>{contents.length.toLocaleString() || "0"}</div>
        </div>
        <div>
          <div>Contents without tags:</div>
          <div>{contentsWithoutTags.length.toLocaleString() || "0"}</div>
        </div>
        <div className="col-span-2">
          <Textarea
            className="h-96 w-full resize-y font-mono"
            value={contentsWithoutTags}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};
