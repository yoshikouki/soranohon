export type Book = {
  id: string;
  title: string;
  creator: string;
  translator: string | undefined;
  bibliographyRaw: string;
  mdx: () => Promise<unknown>;
};

export const books: Record<string, Book> = {
  "59835_72466": {
    id: "59835_72466",
    title: "赤ずきん",
    creator: "グリム Grimm",
    translator: "矢崎源九郎",
    bibliographyRaw: `底本：「グリム童話集（1）」偕成社文庫、偕成社\n1980（昭和55）年6月1刷\n2009（平成21）年6月49刷\n入力：sogo\n校正：チエコ\n2020年12月27日作成`,
    // 絶対パスを使用して明示的にインポート
    mdx: () => {
      console.log("Importing MDX for book 59835_72466");
      try {
        // 本番環境でもデバッグログを出力
        const importPromise = import("@/books/59835_72466.mdx");
        console.log("MDX import promise created successfully");
        return importPromise;
      } catch (error) {
        console.error("Error creating MDX import:", error);
        throw error;
      }
    },
  },
} as const;
