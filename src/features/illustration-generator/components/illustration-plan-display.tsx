import { Book } from "@/books";
import { BookContent } from "@/features/book-content/core";
import { FilesystemPlanRepository } from "../repository/plan-repository";
import { IllustrationPromptDisplay } from "./illustration-prompt-display";

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
    console.error(`MDX content not found for book ID: ${book.id}`);
    return <>Not Found</>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-8">
        <div>物語の文字数</div>
        <div>タグ込み: {contentsLength.toLocaleString()}</div>
        <div>タグなし: {contentsWithoutTagsLength.toLocaleString()}</div>
      </div>
      {plan ? (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-8">
            <h3 className="font-semibold text-lg">現在の挿絵計画</h3>
            <div className="text-muted-foreground text-sm">
              {plan.rawPlan.length.toLocaleString()}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted p-4">
            <pre className="max-h-96 overflow-x-auto whitespace-pre-wrap text-sm">
              {plan.rawPlan}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">挿絵計画</h3>
          <p className="text-muted-foreground text-sm">
            現在、挿絵計画は作成されていません。下のフォームから作成できます。
          </p>
          <IllustrationPromptDisplay
            bookId={book.id}
            title={book.title}
            contentWithTags={bookContent.toStringWithoutTags()}
          />
        </div>
      )}
    </div>
  );
}
