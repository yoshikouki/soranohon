/**
 * Central location for all filesystem paths
 * Used to avoid hardcoding file paths throughout the application
 */

export const filePaths = {
  books: {
    sources: {
      mdx: (bookId: string) => `./src/books/${bookId}.mdx`,
      plan: (bookId: string) => `./src/books/${bookId}.plan.md`,
    },
  },
};
