import { paths } from "@/lib/paths";

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
    coverImage: paths.images.books.scenes("59835_72466", 1),
    mdx: () => import("./59835_72466.mdx"),
  },
  "59521_71684": {
    id: "59521_71684",
    title: "オオカミと七ひきの子ヤギ",
    creator: "グリム　Grimm",
    translator: "矢崎源九郎訳",
    bibliographyRaw: `底本：「グリム童話集（1）」偕成社文庫、偕成社\n1980（昭和55）年6月1刷\n2009（平成21）年6月49刷\n入力：sogo\n校正：チエコ\n2020年8月28日作成\n青空文庫作成ファイル：\nこのファイルは、インターネットの図書館、青空文庫（https://www.aozora.gr.jp/）で作られました。入力、校正、制作にあたったのは、ボランティアの皆さんです。`,
    aozoraBunkoUrl: "https://www.aozora.gr.jp/cards/001091/card59521.html",
    mdx: () => import("./59521_71684.mdx"),
  },
  "42308_17916": {
    id: "42308_17916",
    title: "白雪姫",
    creator: "グリム",
    translator: "菊池寛訳",
    bibliographyRaw: `\n\n\n底本：「グリム　世界名作　白雪姫」光文社\n\n　　　1949（昭和24）年3月5日初版発行\n※「旧字、旧仮名で書かれた作品を、現代表記にあらためる際の作業指針」に基づいて、底本の表記をあらためました。\n入力：大久保ゆう\n校正：鈴木厚司\n2005年2月22日作成\n青空文庫作成ファイル：\nこのファイルは、インターネットの図書館、青空文庫（http://www.aozora.gr.jp/）で作られました。入力、校正、制作にあたったのは、ボランティアの皆さんです。\n\n\n`,
    aozoraBunkoUrl: "https://www.aozora.gr.jp/cards/001091/card42308.html",
    mdx: () => import("./42308_17916.mdx"),
  },
} as const;
