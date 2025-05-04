import Image from "next/image";
import Link from "next/link";
import { books } from "@/books";

export default function Home() {
  const bookList = Object.values(books);

  return (
    <main className="flex w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="pb-12 text-center">
          <p className="text-xl">青空文庫の児童文学を読むためのサイト</p>
          <p className="pt-2 text-lg">大きな文字とやさしい表示で、みんなが読みやすい</p>
        </div>

        <h2 className="pb-12 text-center font-bold text-3xl">よむほん</h2>

        <ul className="grid grid-cols-1 gap-12 sm:grid-cols-2">
          {bookList.map((book) => (
            <li key={book.id}>
              <Link
                href={`/books/${book.id}`}
                className="group flex flex-col items-center pb-6 transition-colors hover:text-primary"
              >
                <div className="flex h-20 w-20 items-center justify-center">
                  {book.imageSrc ? (
                    <Image
                      src={book.imageSrc}
                      alt={book.title}
                      width={70}
                      height={70}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-4xl">📚</div>
                  )}
                </div>
                <div className="flex flex-col items-center space-y-1 pt-4">
                  <h3 className="text-center font-bold text-2xl">{book.title}</h3>
                  {book.description && (
                    <p className="text-center text-muted-foreground">{book.description}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
