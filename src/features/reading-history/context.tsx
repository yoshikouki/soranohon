"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type ReadingHistoryDialogContextType = {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

const ReadingHistoryDialogContext = createContext<ReadingHistoryDialogContextType | undefined>(
  undefined,
);

export function useReadingHistoryDialog() {
  const context = useContext(ReadingHistoryDialogContext);
  if (!context) {
    throw new Error(
      "useReadingHistoryDialog must be used within a ReadingHistoryDialogProvider",
    );
  }
  return context;
}

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
