"use client";

import { User2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewerSettingsMenu } from "@/features/book-viewer/components/viewer-settings-menu";
import { paths } from "@/lib/paths";

export const Header = () => {
  return (
    <>
      <header className="w-full">
        <div className="container flex h-16 max-w-screen-xl items-center px-4">
          <div className="flex items-center gap-6">
            <Link
              href={paths.home()}
              className="flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Image
                src={paths.images.logo()}
                loading="eager"
                alt="service logo"
                width={24}
                height={24}
                className="rounded-sm"
              />
              <h1 className="font-bold text-lg">そらのほん</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="fixed top-0 right-0 z-20 flex items-center justify-center p-4">
        <nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 rounded-full bg-background/80 shadow-sm backdrop-blur"
              >
                <User2Icon className="size-5" />
                <span className="sr-only">ユーザーメニュー</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={"w-72"}>
              <DropdownMenuItem>
                <ViewerSettingsMenu />
              </DropdownMenuItem>
              <DropdownMenuItem>おきに入り</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </>
  );
};
