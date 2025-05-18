import { books } from "@/books";
import { FilesystemPlanRepository } from "@/features/illustration-generator/repository/plan-repository";
import { generateCharacterDesign } from "@/features/illustration-generator/services/character-design-service";
import { generateKeyVisual } from "@/features/illustration-generator/services/key-visual-service";
import { generateScene } from "@/features/illustration-generator/services/scene-service";

const isDevEnvironment = () => {
  return process.env.NODE_ENV === "development";
};

interface IllustrationRequest {
  type: "key-visual" | "scene" | "character-design";
  sceneId?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  if (!isDevEnvironment()) {
    return Response.json({ error: "この機能は開発環境でのみ利用可能です" }, { status: 403 });
  }

  const { bookId } = await params;
  const book = books[bookId];
  if (!book) {
    return Response.json({ error: `書籍が見つかりません: ${bookId}` }, { status: 404 });
  }

  const data = (await request.json()) as IllustrationRequest;
  if (!data.type) {
    return Response.json({ error: "生成タイプが指定されていません" }, { status: 400 });
  }

  const planRepository = new FilesystemPlanRepository();
  const plan = await planRepository.getPlan(bookId);
  if (!plan || !plan.plan) {
    return Response.json({ error: "挿絵計画が見つかりません" }, { status: 404 });
  }

  if (data.type === "scene" && !data.sceneId) {
    return Response.json({ error: "シーンIDが指定されていません" }, { status: 400 });
  }

  let result: { imagePath: string; prompt: string };

  switch (data.type) {
    case "key-visual":
      result = await generateKeyVisual({ bookId, book, plan });
      break;
    case "scene":
      result = await generateScene({ bookId, plan, sceneId: data.sceneId! });
      break;
    case "character-design":
      result = await generateCharacterDesign({ bookId, book, plan });
      break;
    default:
      return Response.json({ error: "不明な生成タイプです" }, { status: 400 });
  }

  return Response.json(
    {
      success: true,
      imagePath: result.imagePath,
      message: "画像を生成しました",
      prompt: result.prompt,
    },
    { status: 200 },
  );
}
