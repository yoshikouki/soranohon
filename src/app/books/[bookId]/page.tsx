import { Metadata } from "next";
import { notFound } from "next/navigation";
import { books } from "@/books";
import { cn } from "@/lib/utils";
import styles from "./books.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  const { bookId } = await params;
  const book = books[bookId as keyof typeof books];
  if (!book) return {};
  return {
    title: book.title + " | そらのほん",
    description: `青空文庫『${book.title}』を子ども向けに読みやすく表示します。`,
  };
}

type MdxModule = { default: React.ComponentType };
function isMdxModule(mod: unknown): mod is MdxModule {
  return typeof mod === "object" && mod !== null && "default" in mod;
}

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const book = books[bookId as keyof typeof books];
  if (!book?.mdx) {
    console.error(`Invalid book data for ID: ${bookId}`);
    return notFound();
  }
  const mod = await book.mdx();
  if (!isMdxModule(mod)) {
    console.error(`Invalid MDX module for book: ${bookId}`);
    return notFound();
  }

  const BookContent = mod.default;
  const title = book.title;

  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <div className="max-w-2xl sm:rounded-lg sm:p-10 sm:shadow">
        <h1 className="sticky top-0 z-10 bg-background/60 p-4 font-bold text-3xl backdrop-blur-sm sm:text-4xl">
          {title}
        </h1>
        <div
          className={cn(
            "prose prose-lg p-4 text-xl leading-12 [&_rt]:text-sm [&_rt]:leading-none",
            "sm:prose-xl sm:text-2xl sm:leading-13 sm:[&_rt]:text-base",
            styles.booksLineBreak,
          )}
        >
          <BookContent />
        </div>
      </div>
    </main>
  );
}
