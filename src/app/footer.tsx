import Link from "next/link";
import { GitHubIcon } from "@/components/icons/github-icon";
import { XIcon } from "@/components/icons/x-icon";

export const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-5">
          <Link
            href="https://github.com/yoshikouki/soranohon"
            className="transition-colors hover:text-primary"
          >
            <GitHubIcon className="size-5" />
          </Link>
          <Link
            href="https://x.com/yoshikouki_"
            className="transition-colors hover:text-primary"
          >
            <XIcon className="size-4 stroke-current" />
          </Link>
        </div>

        <div className="text-center text-muted-foreground text-sm">
          © 2024 そらのほん by yoshikouki
        </div>
      </div>
    </footer>
  );
};
