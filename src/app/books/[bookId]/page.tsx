import { Metadata } from "next";
import Link from "next/link";
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
    <main className="flex h-full w-full flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-3xl">
        <h1 className="sticky top-0 z-10 bg-background/60 py-4 text-center font-bold text-3xl backdrop-blur-sm sm:text-4xl">
          {title}
        </h1>
      </div>
      <div
        className={cn(
          "prose prose-xl max-w-3xl leading-loose [&>p]:py-4",
          "[&_rt]:text-center [&_rt]:font-normal [&_rt]:text-foreground/60 [&_rt]:text-sm",
          styles.booksLineBreak,
        )}
      >
        <BookContent />
      </div>
      <div className="py-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 py-2 font-bold text-primary transition-colors hover:text-primary/70"
        >
          ← ほんのリストに もどる
        </Link>
      </div>
    </main>
  );
}
