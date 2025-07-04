import path from "path";
import sharp from "sharp";
import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { logger } from "@/lib/logger";
import { paths } from "@/lib/paths";

interface SaveOptions {
  sceneId?: string;
  filename?: string;
  type?: "key-visual" | "scene" | "character-design";
}

export interface IllustrationRepository {
  saveIllustration(
    bookId: string,
    imageData: Uint8Array | string,
    options?: SaveOptions,
  ): Promise<string>;
  getIllustrationPath(bookId: string, options?: SaveOptions): string;
  hasKeyVisual(bookId: string): boolean;
  hasCharacterDesign(bookId: string): boolean;
}

export class FilesystemIllustrationRepository implements IllustrationRepository {
  private fs: FileSystem;

  constructor(fs: FileSystem = defaultFileSystem) {
    this.fs = fs;
  }

  hasKeyVisual(bookId: string): boolean {
    const keyVisualPath = this.getPublicFilePath(bookId);
    return this.fs.existsSync(keyVisualPath);
  }

  hasCharacterDesign(bookId: string): boolean {
    const characterDesignPath = this.getPublicFilePath(bookId, { type: "character-design" });
    return this.fs.existsSync(characterDesignPath);
  }

  private ensureDirectoryExists(directoryPath: string): void {
    if (!this.fs.existsSync(directoryPath)) {
      logger.info(`Creating directory: ${directoryPath}`);
      this.fs.mkdirSync(directoryPath, { recursive: true });
      logger.info(`Directory created: ${directoryPath}`);
    }
  }

  getIllustrationPath(bookId: string, options?: SaveOptions): string {
    if (options?.type === "character-design") {
      return paths.images.books.characterDesign(bookId);
    } else if (options?.sceneId) {
      const sceneIndex = parseInt(options.sceneId.replace(/[^0-9]/g, ""), 10);
      return paths.images.books.scene(bookId, sceneIndex);
    } else if (options?.filename) {
      return paths.images.books.custom(bookId, options.filename);
    } else {
      return paths.images.books.keyVisual(bookId);
    }
  }

  private getPublicFilePath(bookId: string, options?: SaveOptions): string {
    const baseDir = this.fs.getCwd();
    if (options?.type === "character-design") {
      return this.fs.join(
        baseDir,
        filePaths.books.publicPaths.characterDesign(bookId).replace(/^\.\//, ""),
      );
    } else if (options?.sceneId) {
      const sceneIndex = parseInt(options.sceneId.replace(/[^0-9]/g, ""), 10);
      return this.fs.join(
        baseDir,
        filePaths.books.publicPaths.scene(bookId, sceneIndex).replace(/^\.\//, ""),
      );
    } else if (options?.filename) {
      return this.fs.join(
        baseDir,
        filePaths.books.publicPaths.custom(bookId, options.filename).replace(/^\.\//, ""),
      );
    } else {
      return this.fs.join(
        baseDir,
        filePaths.books.publicPaths.keyVisual(bookId).replace(/^\.\//, ""),
      );
    }
  }

  async saveIllustration(
    bookId: string,
    imageData: Uint8Array | string,
    options?: SaveOptions,
  ): Promise<string> {
    const bookDirPath = path.join(this.fs.getCwd(), "public", "images", "books", bookId);
    this.ensureDirectoryExists(bookDirPath);

    const filePath = this.getPublicFilePath(bookId, options);
    const dirPath = path.dirname(filePath);
    this.ensureDirectoryExists(dirPath);

    logger.info(`Saving illustration to file: ${filePath}`);

    const buffer =
      typeof imageData === "string"
        ? Buffer.from(imageData.replace(/^data:image\/\w+;base64,/, ""), "base64")
        : Buffer.from(imageData);

    await sharp(buffer).webp({ quality: 90 }).toFile(filePath);

    logger.info(`Illustration saved to: ${filePath}`);

    return this.getIllustrationPath(bookId, options);
  }
}
