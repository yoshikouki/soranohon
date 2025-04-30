import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center justify-center">
      <p className="text-lg">青空文庫の児童文学を読むためのサイト</p>
      <ul className="mt-8 space-y-4">
        <li>
          <Link
            href="/books/001091"
            className="block rounded-lg bg-primary text-primary-foreground px-6 py-4 text-xl font-bold shadow hover:bg-primary/80 transition"
          >
            赤ずきん
          </Link>
        </li>
      </ul>
    </main>
  );
}
