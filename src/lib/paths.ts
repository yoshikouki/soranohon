/**
 * Central location for all application paths and URLs
 * Used to avoid hardcoding paths throughout the application
 */

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "https://soranohon.vercel.app";

// Internal application paths (all starting with /)
export const paths = {
  home: () => "/",
  books: {
    root: () => "/books",
    detail: (bookId: string) => `/books/${bookId}`,
    illustrationPlans: (bookId: string) => `/books/${bookId}/illustration-plans`,
    illustrations: (bookId: string) => `/books/${bookId}/illustrations`,
  },
  images: {
    books: {
      keyVisual: (bookId: string) => `/images/books/${bookId}/key-visual.webp`,
      characterDesign: (bookId: string) => `/images/books/${bookId}/character-design.webp`,
      scene: (bookId: string, sceneIndex: number) =>
        `/images/books/${bookId}/scene-${sceneIndex}.webp`,
      custom: (bookId: string, filename: string) => `/images/books/${bookId}/${filename}.webp`,
      scenes: (bookId: string, sceneNumber: number) =>
        `/images/books/${bookId}/scene-${sceneNumber}.webp`,
    },
    logo: () => "/logo.webp",
    logoNoPadding: () => "/logo-no-padding.webp",
    icons: {
      small: () => "/icon-192x192.webp",
      large: () => "/icon-512x512.webp",
    },
  },
};

// External URLs (all starting with https://)
export const urls = {
  images: {
    books: {
      keyVisual: (bookId: string) => toUrl(paths.images.books.keyVisual(bookId)),
      characterDesign: (bookId: string) => toUrl(paths.images.books.characterDesign(bookId)),
    },
  },
  github: () => "https://github.com/yoshikouki/soranohon",
  twitter: () => "https://twitter.com/yoshikouki_",
};

const toUrl = (path: string) => new URL(path, BASE_URL).toString();
