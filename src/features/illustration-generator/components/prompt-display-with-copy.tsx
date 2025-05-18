import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CopyPromptButton } from "./copy-prompt-button";

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
            <CopyPromptButton prompt={prompt} className="mr-4" />
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
