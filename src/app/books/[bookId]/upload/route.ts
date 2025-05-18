import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";
import { filePaths } from "@/lib/file-paths";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const { bookId } = await params;
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const imageType = formData.get("imageType") as string;

  if (!file || !imageType) {
    return NextResponse.json({ error: "ファイルとimageTypeは必須です" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "画像ファイルを選択してください" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let outputPath: string;
  if (imageType === "key-visual") {
    outputPath = filePaths.books.publicPaths.keyVisual(bookId);
  } else if (imageType === "character-design") {
    outputPath = filePaths.books.publicPaths.characterDesign(bookId);
  } else if (imageType.startsWith("scene-")) {
    const sceneIndex = parseInt(imageType.replace("scene-", ""), 10);
    outputPath = filePaths.books.publicPaths.scene(bookId, sceneIndex);
  } else {
    outputPath = filePaths.books.publicPaths.custom(bookId, imageType);
  }

  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, { recursive: true });

  await sharp(buffer)
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(outputPath);

  const publicPath = outputPath.replace(/^\.?\/public/, "");

  logger.info(`Image uploaded: ${publicPath}`);

  return NextResponse.json({ imagePath: publicPath });
}
