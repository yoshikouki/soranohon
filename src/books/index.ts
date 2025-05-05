export type Book = {
  id: string;
  title: string;
  creator: string;
  translator: string | undefined;
  bibliographyRaw: string;
  description?: string;
  aozoraBunkoUrl: string;
  bookTitle?: string;
  ndc?: string;
  imageSrc?: string;
  coverImage?: string;
  textLength?: number; // テキスト長（バイト数）
  readingTime?: number; // 推定読書時間（分）
  mdx: () => Promise<unknown>;
};

export const books: Record<string, Book> = {
  "59835_72466": {
    id: "59835_72466",
    title: "赤ずきん",
    creator: "グリム Grimm",
    translator: "矢崎源九郎",
    bibliographyRaw: `底本：「グリム童話集（1）」偕成社文庫、偕成社\n1980（昭和55）年6月1刷\n2009（平成21）年6月49刷\n入力：sogo\n校正：チエコ\n2020年12月27日作成\n青空文庫作成ファイル：\nこのファイルは、インターネットの図書館、青空文庫（https://www.aozora.gr.jp/）で作られました。入力、校正、制作にあたったのは、ボランティアの皆さんです。`,
    description: "おばあさんのところへ行くために森を抜ける少女のお話",
    aozoraBunkoUrl: "https://www.aozora.gr.jp/cards/001091/card59835.html",
    bookTitle: "グリム童話集（1）",
    ndc: "NDC K943",
    coverImage: "/images/books/59835_72466/scene-1.webp",
    mdx: () => import("./59835_72466.mdx"),
  },
} as const;
