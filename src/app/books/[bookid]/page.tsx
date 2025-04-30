import { notFound } from "next/navigation";
import { Metadata } from "next";


const bookIdTable: Record<string, string> = {
  "001091": "59835_72466.html",
}

const baseUrl = process.env.BASE_URL || "http://localhost:8888";

export async function generateMetadata({ params }: { params: Promise<{ bookId: string }> }): Promise<Metadata> {
  const { bookId } = await params;
  const file = new URL(`/assets/books/html/${bookIdTable[bookId]}`, baseUrl).toString();
  const res = await fetch(file);
  if (!res.ok) return {};
  const html = await res.text();
  const titleMatch = html.match(/<h1 class="title">([^<]+)<\/h1>/);
  return {
    title: (titleMatch ? titleMatch[1] : bookId) + " | そらのほん",
    description: `青空文庫『${
      titleMatch ? titleMatch[1] : bookId
    }』を子ども向けに読みやすく表示します。`,
  };
}

function extractMainText(html: string) {
  const match = html.match(/<div class=\"main_text\"[^>]*>([\s\S]*?)<\/div>/);
  return match ? match[1] : "";
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  const file = new URL(`/assets/books/html/${bookIdTable[bookId]}`, baseUrl).toString();
  const res = await fetch(file);
  if (!res.ok) return notFound();
  const html = await res.text();
  const mainTextHtml = extractMainText(html);
  const titleMatch = html.match(/<h1 class="title">([^<]+)<\/h1>/);
  const title = titleMatch ? titleMatch[1] : bookId;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-10 rounded-lg shadow mt-8 mb-16">
      <h1 className="sticky top-0 z-10 py-4 bg-background/60 backdrop-blur-sm text-3xl sm:text-4xl font-bold mb-6 text-center">
        {title}
      </h1>
      <div
        className="prose prose-lg sm:prose-xl max-w-none leading-loose text-lg sm:text-xl"
        style={{ lineHeight: 2, fontSize: "1.25rem" }}
        dangerouslySetInnerHTML={{ __html: mainTextHtml }}
      />
    </div>
  );
}
