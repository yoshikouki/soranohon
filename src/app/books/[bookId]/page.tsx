import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { books } from "@/books";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/utils";
import { BookVisitRecorder } from "./book-visit-recorder";
import styles from "./books.module.css";
import { ReadHistoryButton } from "./read-history-button";

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
    <main className="relative flex h-full w-full flex-col items-center justify-center py-6">
      <div className="sticky top-0 z-10 flex h-16 w-full items-center justify-between bg-background/80 px-4 backdrop-blur-sm">
        <div className="flex-1"></div>
        <h1 className="flex-2 text-center font-bold text-3xl sm:text-4xl">{title}</h1>
        <div className="flex flex-1 justify-end">
          <ReadHistoryButton
            book={{
              bookId: bookId,
              title: title,
              coverImage: book.coverImage,
            }}
          />
        </div>
      </div>
      <div
        className={cn(
          "prose prose-xl max-w-3xl font-semibold leading-loose",
          "[&_rt]:font-normal [&_rt]:text-foreground/60 [&_rt]:text-sm",
          styles.booksLineBreak,
        )}
      >
        <BookContent />
      </div>
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <ReadHistoryButton
          book={{
            bookId: bookId,
            title: title,
            coverImage: book.coverImage,
          }}
          variant="default"
          completed={true}
          label="読了しました"
        />
        <Link
          href={paths.home()}
          className="inline-flex items-center gap-1 py-2 font-bold text-primary transition-colors hover:text-primary/70"
        >
          ← ほんのリストに もどる
        </Link>
      </div>

      {/* 自動記録コンポーネント */}
      <BookVisitRecorder
        book={{
          bookId: bookId,
          title: title,
          coverImage: book.coverImage,
        }}
      />
    </main>
  );
}
