import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { books } from "@/books";
import { BookContent } from "@/features/book-content/core";
import { IllustrationPlanDisplay } from "@/features/illustration-generator/components/illustration-plan-display";
import { MdxEditor } from "@/features/illustration-generator/components/mdx-editor";
import { paths } from "@/lib/paths";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  const { bookId } = await params;
  const book = books[bookId as keyof typeof books];
  if (!book) return {};
  return {
    title: `${book.title}の編集 | そらのほん`,
    description: `青空文庫『${book.title}』の挿絵を編集します。`,
  };
}

export default async function BookEditPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const book = books[bookId as keyof typeof books];
  if (!book?.mdx) {
    console.error(`Invalid book data for ID: ${bookId}`);
    return notFound();
  }
  const isDevelopment = process.env.NODE_ENV === "development";
  if (!isDevelopment) {
    console.error("Development mode only");
    notFound();
  }

  const bookContent = await BookContent.readFileByBookId(bookId);
  if (!bookContent) {
    console.error(`MDX content not found for book ID: ${bookId}`);
    notFound();
  }

  const title = book.title;

  return (
    <main className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-bold text-3xl">{title}の編集</h1>
        <Link
          href={paths.books.detail(bookId)}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/80"
        >
          閲覧ページに戻る
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-xl">挿絵計画の作成</h2>
          <IllustrationPlanDisplay book={book} />
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <MdxEditor
            contents={bookContent.toMdx()}
            contentsWithoutTags={bookContent.toStringWithoutTags()}
          />
        </div>
      </div>
    </main>
  );
}
