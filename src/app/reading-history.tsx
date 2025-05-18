"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReadingHistoryList } from "@/features/reading-history/components/reading-history-list";
import { useReadingHistoryDialog } from "@/features/reading-history/context";
import { useReadingHistory } from "@/features/reading-history/hooks/use-reading-history";

export function ReadingHistoryDialog() {
  const { isOpen, closeDialog } = useReadingHistoryDialog();
  const { history, isLoading, removeFromHistory, clearHistory, refetch: refreshHistory } =
    useReadingHistory();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      refreshHistory();
    } else {
      closeDialog();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">読書履歴</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ReadingHistoryList
            history={history}
            isLoading={isLoading}
            onRemove={removeFromHistory}
            onClear={clearHistory}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReadingHistoryDialogWithTrigger() {
  const { openDialog } = useReadingHistoryDialog();

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={openDialog}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        role="img"
      >
        <title>本のアイコン</title>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      読書履歴
    </Button>
  );
}
