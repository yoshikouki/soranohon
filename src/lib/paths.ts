/**
 * Central location for all application paths and URLs
 * Used to avoid hardcoding paths throughout the application
 */

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
  github: () => "https://github.com/yoshikouki/soranohon",
  twitter: () => "https://twitter.com/yoshikouki_",
};
