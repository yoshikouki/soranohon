import { Book } from "@/books";
import { BookContent } from "@/features/book-content/core";
import { FilesystemPlanRepository } from "../repository/plan-repository";
import { IllustrationPromptDisplay } from "./illustration-prompt-display";

interface IllustrationPlanDisplayProps {
  book: Book;
}

export async function IllustrationPlanDisplay({ book }: IllustrationPlanDisplayProps) {
  const filesystemPlanRepository = new FilesystemPlanRepository();
  const plan = await filesystemPlanRepository.getPlan(book.id);
  const bookContent = await BookContent.readFileByBookId(book.id);
  if (!bookContent) {
    console.error(`MDX content not found for book ID: ${book.id}`);
    return <>Not Found</>;
  }

  return (
    <div className="mb-6">
      {plan ? (
        <>
          <h3 className="mb-2 font-semibold text-lg">現在の挿絵計画</h3>
          <div className="mb-4 rounded-md border border-border bg-muted p-4">
            <pre className="max-h-96 overflow-x-auto whitespace-pre-wrap text-sm">
              {plan.rawPlan}
            </pre>
          </div>
        </>
      ) : (
        <>
          <h3 className="mb-2 font-semibold text-lg">挿絵計画</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            現在、挿絵計画は作成されていません。下のフォームから作成できます。
          </p>
          <IllustrationPromptDisplay
            bookId={book.id}
            title={book.title}
            contentWithTags={bookContent.toStringWithoutTags()}
          />
        </>
      )}
    </div>
  );
}
