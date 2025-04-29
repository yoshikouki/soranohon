export default function Home() {
  return (
    <div className="grid min-h-screen gri d-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-[32px] sm:items-start">
        <h1 className="font-bold text-4xl">そらのほん</h1>
        <p className="text-lg">青空文庫の児童文学を読むためのサイト</p>
      </main>
    </div>
  );
}
