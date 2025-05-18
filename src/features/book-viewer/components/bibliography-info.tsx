import { ExternalLinkIcon } from "lucide-react";
import type { Book } from "@/books";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function BibliographyInfo({ book, className }: { book: Book; className?: string }) {
  return (
    <Card className={cn("rounded-xl bg-muted/30 p-6 sm:p-8", className)}>
      <div className="space-y-6 text-sm sm:text-base">
        <div className="space-y-4">
          <h2 className="font-bold text-primary text-xl sm:text-2xl">この おはなしについて</h2>
          <div className="grid gap-3">
            <div>
              <span>おはなし：</span>
              <span className="font-semibold">{book.title}</span>
            </div>
            <div>
              <span>さくしゃ：</span>
              <span className="font-semibold">{book.creator}</span>
            </div>
            {book.translator && (
              <div>
                <span>ほんやく：</span>
                <span className="font-semibold">{book.translator}</span>
              </div>
            )}
            <p>
              <Button variant={"link"} className="px-0">
                <a
                  href={book.aozoraBunkoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex gap-1"
                >
                  青空文庫の作品ページを見る <ExternalLinkIcon className="size-4" />
                </a>
              </Button>
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="font-semibold text-primary">しゅってん</h3>
          <div className="space-y-2 text-muted-foreground">
            {book.bibliographyRaw
              .split("\n")
              .filter((line) => line.trim())
              .map((line) => (
                <p key={line}>{line}</p>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
