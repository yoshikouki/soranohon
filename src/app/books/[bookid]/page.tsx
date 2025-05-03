import { Metadata } from "next";
import { notFound } from "next/navigation";
import { books } from "@/books";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookId: string }>;
}): Promise<Metadata> {
  // paramsが確実に存在することを確認
  const resolvedParams = await params;
  const bookId = resolvedParams?.bookId || "";
  const book = books[bookId as keyof typeof books];
  if (!book) return {};
  return {
    title: book.title + " | そらのほん",
    description: `青空文庫『${book.title}』を子ども向けに読みやすく表示します。`,
  };
}

export default async function BookPage({ params }: { params: Promise<{ bookId: string }> }) {
  // paramsが確実に存在することを確認
  const resolvedParams = await params;
  const bookId = resolvedParams?.bookId || "";

  // bookIdが存在するか確認
  if (!(bookId in books)) {
    console.error(`Book not found with ID: ${bookId}`);
    return notFound();
  }

  const book = books[bookId as keyof typeof books];

  // bookオブジェクトの存在確認
  if (!book || !book.mdx) {
    console.error(`Invalid book data for ID: ${bookId}`);
    return notFound();
  }

  // MDXモジュールのインポート
  const importMdx = book.mdx;
  type MdxModule = { default: React.ComponentType };
  function isMdxModule(mod: unknown): mod is MdxModule {
    return typeof mod === "object" && mod !== null && "default" in mod;
  }

  const mod = await importMdx();

  if (!isMdxModule(mod)) {
    console.error(`Invalid MDX module for book: ${bookId}`);
    return notFound();
  }

  const BookContent = mod.default;
  const title = book.title;

  return (
    <div className="mx-auto mt-8 mb-16 max-w-2xl rounded-lg p-6 shadow sm:p-10">
      <h1 className="sticky top-0 z-10 mb-6 bg-background/60 py-4 text-center font-bold text-3xl backdrop-blur-sm sm:text-4xl">
        {title}
      </h1>
      <div
        className="prose prose-lg sm:prose-xl max-w-none text-lg leading-loose sm:text-xl"
        style={{ lineHeight: 2, fontSize: "1.25rem" }}
      >
        <BookContent />
      </div>
    </div>
  );
}
