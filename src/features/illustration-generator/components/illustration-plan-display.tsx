import { Book } from "@/books";
import { IllustrationPlan } from "../services/illustration-plan";
import { IllustrationPromptDisplay } from "./illustration-prompt-display";

interface IllustrationPlanDisplayProps {
  book: Book;
}

export async function IllustrationPlanDisplay({ book }: IllustrationPlanDisplayProps) {
  const plan = await IllustrationPlan.readFileByBookId(book.id);

  return (
    <div className="mb-6">
      {plan ? (
        <>
          <h3 className="mb-2 font-semibold text-lg">現在の挿絵計画</h3>
          <div className="mb-4 rounded-md border border-border bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm">{plan.content}</pre>
          </div>
        </>
      ) : (
        <>
          <h3 className="mb-2 font-semibold text-lg">挿絵計画</h3>
          <p className="mb-4 text-muted-foreground text-sm">
            現在、挿絵計画は作成されていません。下のフォームから作成できます。
          </p>
          <IllustrationPromptDisplay bookId={book.id} title={book.title} />
        </>
      )}
    </div>
  );
}
