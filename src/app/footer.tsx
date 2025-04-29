import Link from "next/link";
import { GitHubIcon } from "@/components/icons/github-icon";
import { XIcon } from "@/components/icons/x-icon";

export const Footer = () => {
  return (
    <footer className="mt-20 flex w-full flex-col items-center justify-center gap-4 p-4">
      <div className="flex items-center gap-4 p-4">
        <Link href="https://github.com/yoshikouki/soranohon">
          <GitHubIcon className="size-6" />
        </Link>
        <Link href="https://x.com/yoshikouki_">
          <XIcon className="size-4 stroke-primary" />
        </Link>
      </div>
      {/* copyright */}
      <div className="text-primary/50 text-sm">Copyright © 2024 yoshikouki</div>
    </footer>
  );
};
