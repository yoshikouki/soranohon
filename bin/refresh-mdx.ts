#!/usr/bin/env bun

import {
  convertHtmlUrlToFilePath,
  getAozoraBunkoHtmlUrl,
} from "@packages/aozorabunko-card-lists";
import { books } from "@/books";
import { logger } from "../src/lib/logger";
import { processHtmlFile } from "./html2mdx";

async function main() {
  logger.info("Starting to refresh MDX files for all books in src/books/index.ts...");
  const bookIds = Object.keys(books);
  logger.info(`Found ${bookIds.length} book(s) to process.`);

  for (const bookId of bookIds) {
    const book = books[bookId];
    logger.info("\n\n--------------------------------\n");
    logger.info(`Processing book: "${book.title}" (ID: ${book.id})`);
    try {
      const htmlFileUrl = getAozoraBunkoHtmlUrl(book.id);
      const htmlFilePath = convertHtmlUrlToFilePath(htmlFileUrl);
      logger.info(`Input HTML URL: ${htmlFileUrl}`);
      logger.info(`Input HTML path: ${htmlFilePath}`);
      await processHtmlFile(htmlFilePath);
      logger.info(`Successfully refreshed MDX for: "${book.title}" (ID: ${book.id})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to process book "${book.title}" (ID: ${book.id}): ${errorMessage}`);
    }
  }

  logger.info("\n\n--------------------------------\n");
  logger.info("Finished refreshing MDX files.");
}

if (require.main === module) {
  main().catch((err) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error(`Critical error in refresh-mdx script: ${errorMessage}`);
    if (err instanceof Error && err.stack) {
      logger.error(err.stack);
    }
    process.exit(1);
  });
}
