import { ClipboardIcon } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PromptDisplayWithCopyProps {
  prompt: string;
  title: string;
  itemValue: string;
}

export function PromptDisplayWithCopy({
  prompt,
  title,
  itemValue,
}: PromptDisplayWithCopyProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={itemValue} className="border-0">
        <AccordionTrigger className="rounded-md px-4 py-2 text-primary hover:bg-muted/20">
          <div className="flex w-full items-center justify-between">
            <span className="font-medium text-sm">{title}</span>
            <CopyButton
              value={prompt}
              icon={false}
              className="mr-4 inline-flex h-9 items-center rounded-md border border-input bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:bg-accent hover:text-accent-foreground hover:text-accent-foreground"
            >
              <ClipboardIcon className="mr-2 h-4 w-4" />
              プロンプトをコピー
            </CopyButton>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-lg bg-muted/30 p-4">
            <pre className="max-h-96 overflow-x-auto whitespace-pre-wrap text-muted-foreground text-xs">
              {prompt}
            </pre>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
