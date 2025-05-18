import Image from "next/image";
import Link from "next/link";
import { books } from "@/books";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { paths } from "@/lib/paths";

export default function Home() {
  const bookList = Object.values(books);

  return (
    <main className="flex w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center gap-4 pb-12 text-center">
          <p className="text-xl">青空文庫で公開されている児童文学を集めました</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {bookList.map((book) => (
            <Link key={book.id} href={paths.books.detail(book.id)}>
              <Card className="h-full transition-all duration-200 hover:text-primary/60">
                <CardHeader className="">
                  <div className="flex h-40 items-center justify-center">
                    {book.coverImage ? (
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        width={120}
                        height={160}
                        className="h-full w-auto object-contain"
                      />
                    ) : (
                      <div className="text-4xl">📚</div>
                    )}
                  </div>
                  <CardTitle className="mt-2 text-2xl">{book.title}</CardTitle>
                </CardHeader>
                {book.description && (
                  <CardContent>
                    <CardDescription className="">{book.description}</CardDescription>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
