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
  // デバッグ情報を出力
  console.log("Books page params:", params);
  console.log("Available books:", Object.keys(books));
  
  // paramsが確実に存在することを確認
  const resolvedParams = await params;
  console.log("Resolved params:", resolvedParams);
  
  const bookId = resolvedParams?.bookId || "";
  console.log("Extracted bookId:", bookId, "Type:", typeof bookId);
  
  // bookIdが存在するか確認
  console.log("bookId exists in books?", bookId in books);
  console.log("books[bookId]:", books[bookId as keyof typeof books]);
  
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
  console.log("Book object:", book);
  console.log("Book MDX function type:", typeof book.mdx);
  
  const importMdx = book.mdx;
  type MdxModule = { default: React.ComponentType };
  function isMdxModule(mod: unknown): mod is MdxModule {
    return typeof mod === "object" && mod !== null && "default" in mod;
  }
  
  console.log("Attempting to import MDX...");
  let mod;
  try {
    mod = await importMdx();
    console.log("MDX module imported:", mod);
    
    if (!isMdxModule(mod)) {
      console.error(`Invalid MDX module for book: ${bookId}`);
      console.log("Module content:", mod);
      return notFound();
    }
    
    console.log("MDX module is valid");
  } catch (error) {
    console.error("Error importing MDX:", error);
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
