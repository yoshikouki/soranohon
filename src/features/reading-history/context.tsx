"use client";

import { createContext, ReactNode, useContext, useState } from "react";

// 読書履歴ダイアログの状態を管理するコンテキスト
type ReadingHistoryDialogContextType = {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const ReadingHistoryDialogContext = createContext<ReadingHistoryDialogContextType | undefined>(
  undefined,
);

// コンテキストを使用するためのフック
export function useReadingHistoryDialog() {
  const context = useContext(ReadingHistoryDialogContext);
  if (!context) {
    throw new Error(
      "useReadingHistoryDialog must be used within a ReadingHistoryDialogProvider",
    );
  }
  return context;
}

// プロバイダーコンポーネント
export function ReadingHistoryDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
  };

  return (
    <ReadingHistoryDialogContext.Provider
      value={{
        isOpen,
        openDialog,
        closeDialog,
      }}
    >
      {children}
    </ReadingHistoryDialogContext.Provider>
  );
}
