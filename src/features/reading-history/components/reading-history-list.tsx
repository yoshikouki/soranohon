"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { paths } from "@/lib/paths";
import { formatDate } from "@/lib/utils";
import { ReadingHistoryEntry } from "../types";

type ReadingHistoryListProps = {
  history: ReadingHistoryEntry[];
  isLoading: boolean;
  onRemove?: (bookId: string) => void;
  onClear?: () => void;
};

export function ReadingHistoryList({
  history,
  isLoading,
  onRemove,
  onClear,
}: ReadingHistoryListProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  // 空の履歴を表示
  if (!isLoading && history.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>読書履歴</CardTitle>
          <CardDescription>まだ読書履歴がありません。</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // ローディング中の表示
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>読書履歴</CardTitle>
          <CardDescription>履歴を読み込んでいます...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* スケルトンローダーには固定数で固有のキーを使用 */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Skeleton className="h-16 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[90px]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Skeleton className="h-16 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[160px]" />
                <Skeleton className="h-4 w-[110px]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 履歴リストを表示
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>読書履歴</CardTitle>
          <CardDescription>最近読んだ本の一覧</CardDescription>
        </div>
        {onClear && (
          <div>
            {!showConfirm ? (
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(true)}>
                すべて削除
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">本当に削除しますか？</span>
                <Button variant="destructive" size="sm" onClick={onClear}>
                  削除
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
                  キャンセル
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={entry.bookId}
              className="flex items-start gap-4 border-b pb-4 last:border-b-0"
            >
              <div className="flex-shrink-0">
                {entry.coverImage ? (
                  <Link href={paths.books.detail(entry.bookId)}>
                    <Image
                      src={entry.coverImage}
                      alt={entry.title}
                      width={48}
                      height={72}
                      className="rounded-sm object-cover"
                    />
                  </Link>
                ) : (
                  <div className="flex h-[72px] w-12 items-center justify-center rounded-sm bg-muted">
                    <span className="text-2xl">📚</span>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <Link href={paths.books.detail(entry.bookId)} className="hover:underline">
                    <h3 className="font-medium">{entry.title}</h3>
                  </Link>
                  {entry.completed && (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-700"
                    >
                      読了済み
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  初回: {formatDate(new Date(entry.firstReadAt))}
                  {entry.lastReadAt && entry.lastReadAt !== entry.firstReadAt && (
                    <> | 最終: {formatDate(new Date(entry.lastReadAt))}</>
                  )}
                </p>
                <div className="mt-1">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      セッション履歴 ({entry.sessions.length}件)
                    </summary>
                    <div className="mt-1 space-y-1 border-muted border-l-2 pl-2">
                      {entry.sessions.map((session) => (
                        <div key={session.sessionId} className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>
                              {formatDate(new Date(session.startedAt))}
                              {session.endedAt && (
                                <> 〜 {formatDate(new Date(session.endedAt))}</>
                              )}
                            </span>
                            {session.completed && (
                              <Badge
                                variant="outline"
                                className="h-4 border-green-200 bg-green-50 px-1 py-0 text-[10px] text-green-700"
                              >
                                読了
                              </Badge>
                            )}
                          </div>
                          {session.notes && (
                            <p className="pl-2 text-xs italic">{session.notes}</p>
                          )}
                          {session.progress !== undefined && (
                            <div className="flex items-center gap-1 pl-2">
                              <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${session.progress}%` }}
                                />
                              </div>
                              <span>{session.progress}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              </div>
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => onRemove(entry.bookId)}
                >
                  <span className="sr-only">削除</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <title>削除ボタン</title>
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
