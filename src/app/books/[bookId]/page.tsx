import { MDXContent } from "mdx/types";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { books } from "@/books";
import { Paragraph } from "@/features/book-viewer/paragraph";
import { StickyImage } from "@/features/book-viewer/sticky-image";
import { logger } from "@/lib/logger";
import { paths } from "@/lib/paths";
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

type MdxModule = { default: MDXContent };
function isMdxModule(mod: unknown): mod is MdxModule {
  return typeof mod === "object" && mod !== null && "default" in mod;
}

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await params;
  const book = books[bookId as keyof typeof books];
  if (!book?.mdx) {
    logger.error(`Invalid book data for ID: ${bookId}`);
    return notFound();
  }
  const mod = await book.mdx();
  if (!isMdxModule(mod)) {
    logger.error(`Invalid MDX module for book: ${bookId}`);
    return notFound();
  }

  const BookContent = mod.default;
  const title = book.title;

  return (
    <main className="relative flex h-full w-full flex-col items-center justify-center py-6">
      <div className="sticky top-0 z-10 flex h-16 w-full items-center justify-center bg-linear-to-b from-background via-background/95 to-background/50 px-4">
        <div className="w-full max-w-3xl px-4">
          <h1 className="text-start font-bold text-3xl sm:text-4xl">{title}</h1>
        </div>
      </div>
      <div
        className={cn(
          "prose prose-xl max-w-3xl font-semibold leading-loose",
          "[&_rt]:font-normal [&_rt]:text-foreground/60 [&_rt]:text-sm",
          styles.booksLineBreak,
        )}
      >
        <BookContent
          components={{
            p: Paragraph,
            img: StickyImage,
          }}
        />
      </div>
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Link
          href={paths.home()}
          className="inline-flex items-center gap-1 py-2 font-bold text-primary transition-colors hover:text-primary/70"
        >
          ← ほんのリストに もどる
        </Link>
      </div>
    </main>
  );
}
