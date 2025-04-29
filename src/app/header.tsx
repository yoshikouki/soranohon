import Image from "next/image";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="flex w-full flex-col items-center justify-center">
      <div className="flex w-full max-w-xl items-center justify-between p-4">
        <Link href={"/"} className="flex items-center justify-center gap-2">
          <Image
            src="/logo-no-padding.webp"
            loading="eager"
            alt="service logo"
            width={32}
            height={32}
          />
          <h1 className="font-black text-6xl">そらのほん</h1>
        </Link>
      </div>
    </header>
  );
};
