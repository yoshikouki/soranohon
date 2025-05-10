#!/usr/bin/env bun
import path from "path"; // プロジェクトルートからの相対パスを解決するために使用
import { books } from "@/books"; // src/books/index.ts を参照
import { defaultLogger } from "@/lib/logger";
import { convertUrlToFilePath, processHtmlFile } from "./html2mdx";

async function main() {
  const logger = defaultLogger;
  logger.info("Starting to refresh MDX files for all books in src/books/index.ts...");

  const bookIds = Object.keys(books);

  if (bookIds.length === 0) {
    logger.info("No books found in src/books/index.ts. Exiting.");
    return;
  }

  logger.info(`Found ${bookIds.length} book(s) to process.`);

  for (const bookId of bookIds) {
    const book = books[bookId];
    const bookTitle = book.title || "Unknown Title";

    if (!book.aozoraBunkoUrl) {
      logger.info(
        `Skipping book "${bookTitle}" (ID: ${book.id}) as aozoraBunkoUrl is not defined.`,
      );
      continue;
    }

    logger.info(`Processing book: "${bookTitle}" (ID: ${book.id})`);

    try {
      const htmlFilePath = convertUrlToFilePath(book.aozoraBunkoUrl);

      const outputMdxPath = path.join("src", "books", `${book.id}.mdx`);

      logger.info(`Input HTML (from URL ${book.aozoraBunkoUrl}): ${htmlFilePath}`);
      logger.info(`Output MDX path: ${outputMdxPath}`);

      await processHtmlFile(htmlFilePath, outputMdxPath);
      logger.info(`Successfully refreshed MDX for: "${bookTitle}" (ID: ${book.id})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to process book "${bookTitle}" (ID: ${book.id}): ${errorMessage}`);
    }
  }

  logger.info("Finished refreshing MDX files.");
}

if (require.main === module) {
  main().catch((err) => {
    const logger = defaultLogger;
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Critical error in refresh-mdx script: ${errorMessage}`);
    if (err instanceof Error && err.stack) {
      console.error(err.stack);
    }
    process.exit(1);
  });
}
