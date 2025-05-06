import { describe, expect, it } from "vitest";
import { paths, urls } from "./paths";

describe("paths", () => {
  describe("home", () => {
    it("should return home path", () => {
      expect(paths.home()).toBe("/");
    });
  });

  describe("books", () => {
    it("should return books root path", () => {
      expect(paths.books.root()).toBe("/books");
    });

    it("should return book detail path with bookId", () => {
      expect(paths.books.detail("test-book")).toBe("/books/test-book");
      expect(paths.books.detail("59835_72466")).toBe("/books/59835_72466");
    });
  });

  describe("images", () => {
    it("should return logo path", () => {
      expect(paths.images.logo()).toBe("/logo.webp");
    });

    it("should return logo no padding path", () => {
      expect(paths.images.logoNoPadding()).toBe("/logo-no-padding.webp");
    });

    it("should return icon paths", () => {
      expect(paths.images.icons.small()).toBe("/icon-192x192.webp");
      expect(paths.images.icons.large()).toBe("/icon-512x512.webp");
    });

    it("should return book scene image path", () => {
      expect(paths.images.books.scenes("59835_72466", 1)).toBe(
        "/images/books/59835_72466/scene-1.webp",
      );
      expect(paths.images.books.scenes("test-book", 5)).toBe(
        "/images/books/test-book/scene-5.webp",
      );
    });
  });
});

describe("urls", () => {
  it("should return github url", () => {
    expect(urls.github()).toBe("https://github.com/yoshikouki/soranohon");
  });

  it("should return twitter url", () => {
    expect(urls.twitter()).toBe("https://twitter.com/yoshikouki_");
  });
});
