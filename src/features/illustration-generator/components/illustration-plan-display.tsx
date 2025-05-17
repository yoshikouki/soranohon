import { Book } from "@/books";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookContent } from "@/features/book-content/core";
import { logger } from "@/lib/logger";
import { FilesystemPlanRepository } from "../repository/plan-repository";
import { IllustrationPromptDisplay } from "./illustration-prompt-display";
import { PlanDisplay } from "./plan-display";

interface IllustrationPlanDisplayProps {
  book: Book;
  contentsLength: number;
  contentsWithoutTagsLength: number;
}

export async function IllustrationPlanDisplay({
  book,
  contentsLength,
  contentsWithoutTagsLength,
}: IllustrationPlanDisplayProps) {
  const filesystemPlanRepository = new FilesystemPlanRepository();
  const plan = await filesystemPlanRepository.getPlan(book.id);
  const bookContent = await BookContent.readFileByBookId(book.id);
  if (!bookContent) {
    logger.error(`MDX content not found for book ID: ${book.id}`);
    return <>Not Found</>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg bg-muted/30 p-4">
        <div className="grid grid-cols-3 text-sm">
          <div className="font-medium text-primary">物語の文字数</div>
          <div>
            <span className="text-muted-foreground text-xs">タグ込み:</span>{" "}
            <span className="font-medium">{contentsLength.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">タグなし:</span>{" "}
            <span className="font-medium">{contentsWithoutTagsLength.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {plan ? (
        <div className="space-y-8">
          <Accordion type="single" collapsible>
            <AccordionItem value="raw-plan" className="border-0">
              <AccordionTrigger className="rounded-md px-4 py-2 text-primary hover:bg-muted/20">
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium text-sm">計画生データ</span>
                  <span className="pr-4 text-muted-foreground text-xs">
                    {plan.rawPlan.length.toLocaleString()}文字
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="rounded-lg bg-muted/30 p-4">
                  <pre className="max-h-96 overflow-x-auto whitespace-pre-wrap text-muted-foreground text-xs">
                    {plan.rawPlan}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {plan.plan && (
            <PlanDisplay
              plan={plan.plan}
              bookId={book.id}
              book={{
                id: book.id,
                title: book.title,
                creator: book.creator,
                translator: book.translator,
                bibliographyRaw: book.bibliographyRaw,
                aozoraBunkoUrl: book.aozoraBunkoUrl,
              }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4 rounded-lg bg-muted/30 p-6">
          <h3 className="font-medium text-primary">挿絵計画がありません</h3>
          <p className="text-muted-foreground text-sm">
            現在、挿絵計画は作成されていません。以下のフォームから作成できます。
          </p>
          <div className="pt-4">
            <IllustrationPromptDisplay
              bookId={book.id}
              title={book.title}
              contentWithTags={bookContent.toStringWithoutTags()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
