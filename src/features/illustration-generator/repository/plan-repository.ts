import * as cheerio from "cheerio";
import { filePaths } from "@/lib/file-paths";
import { defaultFileSystem, FileSystem } from "@/lib/fs";
import { logger } from "@/lib/logger";
import { regex } from "@/lib/regex";
import {
  CharacterSchema,
  IllustrationPlan,
  IllustrationPlanSchema,
  KeyVisualCharaSchema,
  KeyVisualSchema,
  SceneCharaSchema,
  SceneSchema,
} from "../types";

export interface PlanRepository {
  savePlan(bookId: string, rawPlan: string): Promise<boolean>;
  getPlan(bookId: string): Promise<IllustrationPlan | null>;
}

export class FilesystemPlanRepository implements PlanRepository {
  private fs: FileSystem;

  constructor(fs: FileSystem = defaultFileSystem) {
    this.fs = fs;
  }

  private getPlanFilePath(bookId: string): string {
    const baseDir = this.fs.getCwd();
    return this.fs.join(
      baseDir,
      filePaths.books.sources.illustrationPlans(bookId).replace(/^\//, ""),
    );
  }

  async savePlan(bookId: string, rawPlan: string): Promise<boolean> {
    const planFilePath = this.getPlanFilePath(bookId);
    const illustrationPlanXml = this.extractIllustrationPlanXml(rawPlan);
    this.fs.writeFileSync(planFilePath, illustrationPlanXml);
    return true;
  }

  async getPlan(bookId: string): Promise<IllustrationPlan | null> {
    const planFilePath = this.getPlanFilePath(bookId);
    if (!this.fs.existsSync(planFilePath)) {
      return null;
    }
    const planContent = this.fs.readFileSync(planFilePath, "utf8");
    const parsedPlan = this.parseIllustrationPlanXML(planContent);
    if (!parsedPlan) {
      return null;
    }
    return {
      bookId,
      rawPlan: planContent,
      plan: parsedPlan,
    };
  }

  private extractIllustrationPlanXml(rawPlan: string): string {
    const illustrationPlanXml = rawPlan.match(regex.illustrationPlan);
    if (!illustrationPlanXml) {
      logger.error(`Invalid plan format: <plan>...</plan> not found: ${rawPlan.slice(0, 100)}`);
    }
    return illustrationPlanXml?.[0] || rawPlan;
  }

  private parseIllustrationPlanXML(mdContent: string): IllustrationPlanSchema | null {
    const planMatch = mdContent.match(regex.illustrationPlan);
    if (!planMatch) {
      logger.error("Plan content not found in the file");
      return null;
    }

    const planContent = planMatch[0];
    const $ = cheerio.load(planContent, {
      xmlMode: true,
    });

    try {
      const theme = $("theme").text();
      const style = $("style").text();
      const characterCount = parseInt($("character-count").text(), 10) || 0;
      const sceneCount = parseInt($("scene-count").text(), 10) || 0;

      const characters: CharacterSchema[] = [];
      $("chara").each((_, elem) => {
        characters.push({
          name: "chara",
          charaName: { name: "chara-name", value: $(elem).find("chara-name").text() },
          charaAge: {
            name: "chara-age",
            value: $(elem).find("chara-age").text(),
          },
          charaSex: { name: "chara-sex", value: $(elem).find("chara-sex").text() },
          charaAppearance: {
            name: "chara-appearance",
            value: $(elem).find("chara-appearance").text(),
          },
          charaDescription: {
            name: "chara-description",
            value: $(elem).find("chara-description").text(),
          },
        });
      });

      const scenes: SceneSchema[] = [];
      $("scene").each((_, elem) => {
        const sceneCharacters: SceneCharaSchema[] = [];
        $(elem)
          .find("scene-chara")
          .each((_, charaElem) => {
            sceneCharacters.push({
              name: "scene-chara",
              sceneCharaName: {
                name: "scene-chara-name",
                value: $(charaElem).find("scene-chara-name").text(),
              },
              sceneCharaAppearance: {
                name: "scene-chara-appearance",
                value: $(charaElem).find("scene-chara-appearance").text(),
              },
              sceneCharaDescription: {
                name: "scene-chara-description",
                value: $(charaElem).find("scene-chara-description").text(),
              },
              sceneCharaEmotion: {
                name: "scene-chara-emotion",
                value: $(charaElem).find("scene-chara-emotion").text(),
              },
            });
          });

        scenes.push({
          name: "scene",
          sceneIndex: {
            name: "scene-index",
            value: parseInt($(elem).find("scene-index").text(), 10) || 0,
          },
          sceneTitle: { name: "scene-title", value: $(elem).find("scene-title").text() },
          sceneLocation: {
            name: "scene-location",
            value: $(elem).find("scene-location").text(),
          },
          sceneTime: { name: "scene-time", value: $(elem).find("scene-time").text() },
          sceneCharacters: { name: "scene-characters", children: sceneCharacters },
          sceneSituation: {
            name: "scene-situation",
            value: $(elem).find("scene-situation").text(),
          },
          sceneCamera: { name: "scene-camera", value: $(elem).find("scene-camera").text() },
          sceneColorLighting: {
            name: "scene-color-lighting",
            value: $(elem).find("scene-color-lighting").text(),
          },
          sceneNotes: { name: "scene-notes", value: $(elem).find("scene-notes").text() },
        });
      });

      const keyVisualCharacters: KeyVisualCharaSchema[] = [];
      $("key-visual-chara").each((_, elem) => {
        keyVisualCharacters.push({
          name: "key-visual-chara",
          keyVisualCharaName: {
            name: "key-visual-chara-name",
            value: $(elem).find("key-visual-chara-name").text(),
          },
          keyVisualCharaAppearance: {
            name: "key-visual-chara-appearance",
            value: $(elem).find("key-visual-chara-appearance").text(),
          },
          keyVisualCharaDescription: {
            name: "key-visual-chara-description",
            value: $(elem).find("key-visual-chara-description").text(),
          },
          keyVisualCharaEmotion: {
            name: "key-visual-chara-emotion",
            value: $(elem).find("key-visual-chara-emotion").text(),
          },
        });
      });

      const keyVisual: KeyVisualSchema = {
        name: "key-visual",
        keyVisualTitle: { name: "key-visual-title", value: $("key-visual-title").text() },
        keyVisualLocation: {
          name: "key-visual-location",
          value: $("key-visual-location").text(),
        },
        keyVisualTime: { name: "key-visual-time", value: $("key-visual-time").text() },
        keyVisualCharacters: { name: "key-visual-characters", children: keyVisualCharacters },
        keyVisualSituation: {
          name: "key-visual-situation",
          value: $("key-visual-situation").text(),
        },
        keyVisualCamera: { name: "key-visual-camera", value: $("key-visual-camera").text() },
        keyVisualColorLighting: {
          name: "key-visual-color-lighting",
          value: $("key-visual-color-lighting").text(),
        },
        keyVisualNotes: { name: "key-visual-notes", value: $("key-visual-notes").text() },
      };

      return {
        plan: {
          name: "plan",
          theme: { name: "theme", value: theme },
          style: { name: "style", value: style },
          characters: { name: "characters", children: characters },
          characterCount: { name: "character-count", value: characterCount },
          scenes: { name: "scenes", children: scenes },
          sceneCount: { name: "scene-count", value: sceneCount },
          keyVisual,
        },
      };
    } catch (error) {
      logger.error(`解析エラー: ${error}`);
      return null;
    }
  }
}
