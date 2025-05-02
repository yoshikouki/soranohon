import Link from "next/link";

export default function Home() {
  return (
    <main className="flex w-full flex-col items-center justify-center">
      <p className="text-lg">青空文庫の児童文学を読むためのサイト</p>
      <ul className="mt-8 space-y-4">
        <li>
          <Link
            href="/books/59835_72466"
            className="block rounded-lg bg-primary px-6 py-4 font-bold text-primary-foreground text-xl shadow transition hover:bg-primary/80"
          >
            赤ずきん
          </Link>
        </li>
      </ul>
    </main>
  );
}
