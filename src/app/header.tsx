import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="flex w-full flex-col items-center justify-center py-6">
      <div className="flex w-full max-w-3xl items-center justify-between px-4">
        <Link
          href={"/"}
          className="flex items-center justify-center gap-3 transition-colors hover:text-primary"
        >
          <Image
            src="/logo-no-padding.webp"
            loading="eager"
            alt="service logo"
            width={40}
            height={40}
          />
          <h1 className="font-bold text-4xl">そらのほん</h1>
        </Link>
      </div>
    </header>
  );
};
