import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileSystem } from "@/lib/fs";
import { IllustrationPlan } from "../types";
import { FilesystemPlanRepository } from "./plan-repository";

describe("FilesystemPlanRepository", () => {
  let repository: FilesystemPlanRepository;
  let mockFs: FileSystem;
  let samplePlanXml: string;

  beforeEach(() => {
    // ファイルシステムのモック
    mockFs = {
      existsSync: vi.fn().mockReturnValue(true),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn(),
      join: vi.fn((...args) => args.join("/")),
      dirname: vi.fn((path) => path.substring(0, path.lastIndexOf("/"))),
      getCwd: vi.fn(() => "/mock/cwd"),
    };

    repository = new FilesystemPlanRepository(mockFs);

    samplePlanXml = `<plan>
<theme>注意深さと機転による危機克服</theme>
<style>温かみのある手描き風</style>
<characters>
<chara>
<chara-name>おかあさんヤギ</chara-name>
<chara-age>大人</chara-age>
<chara-sex>メス</chara-sex>
<chara-appearance>白い毛並み</chara-appearance>
<chara-description>愛情深く強い母親</chara-description>
</chara>
<chara>
<chara-name>七ひきの子ヤギ</chara-name>
<chara-age>子ども</chara-age>
<chara-sex>不明</chara-sex>
<chara-appearance>白い毛並み</chara-appearance>
<chara-description>元気で無邪気</chara-description>
</chara>
</characters>
<character-count>2</character-count>
<scenes>
<scene>
<scene-index>1</scene-index>
<scene-title>おかあさんの注意</scene-title>
<scene-location>ヤギの家の中</scene-location>
<scene-time>昼</scene-time>
<scene-characters>
<scene-chara>
<scene-chara-name>おかあさんヤギ</scene-chara-name>
<scene-chara-appearance>白い毛並み</scene-chara-appearance>
<scene-chara-description>愛情深い母親</scene-chara-description>
<scene-chara-emotion>心配</scene-chara-emotion>
</scene-chara>
</scene-characters>
<scene-situation>おかあさんヤギが注意している</scene-situation>
<scene-camera>アイレベル</scene-camera>
<scene-color-lighting>暖色系</scene-color-lighting>
<scene-notes>物語の導入部</scene-notes>
</scene>
</scenes>
<scene-count>1</scene-count>
<key-visual>
<key-visual-title>救出シーン</key-visual-title>
<key-visual-location>草原</key-visual-location>
<key-visual-time>昼下がり</key-visual-time>
<key-visual-characters>
<key-visual-chara>
<key-visual-chara-name>おかあさんヤギ</key-visual-chara-name>
<key-visual-chara-appearance>白い毛並み</key-visual-chara-appearance>
<key-visual-chara-description>愛情深い母親</key-visual-chara-description>
<key-visual-chara-emotion>喜び</key-visual-chara-emotion>
</key-visual-chara>
</key-visual-characters>
<key-visual-situation>感動的な再会シーン</key-visual-situation>
<key-visual-camera>アイレベル</key-visual-camera>
<key-visual-color-lighting>明るく温かい光</key-visual-color-lighting>
<key-visual-notes>物語のクライマックス</key-visual-notes>
</key-visual>
</plan>`;
  });

  describe("parseIllustrationPlanXML", () => {
    it("XMLからIllustrationPlanSchemaを正しく生成できること", () => {
      mockFs.readFileSync = vi.fn().mockReturnValue(samplePlanXml);
      const result = repository.getPlan("test_book");
      const parseResult = result.then((data: IllustrationPlan | null) => data?.plan?.plan);

      return expect(parseResult).resolves.toMatchObject({
        name: "plan",
        theme: { name: "theme", value: "注意深さと機転による危機克服" },
        style: { name: "style", value: "温かみのある手描き風" },
        characters: {
          name: "characters",
          children: [
            {
              name: "chara",
              charaName: { name: "chara-name", value: "おかあさんヤギ" },
              charaAge: { name: "chara-age", value: "大人" },
              charaSex: { name: "chara-sex", value: "メス" },
              charaAppearance: { name: "chara-appearance", value: "白い毛並み" },
              charaDescription: { name: "chara-description", value: "愛情深く強い母親" },
            },
            {
              name: "chara",
              charaName: { name: "chara-name", value: "七ひきの子ヤギ" },
              charaAge: { name: "chara-age", value: "子ども" },
              charaSex: { name: "chara-sex", value: "不明" },
              charaAppearance: { name: "chara-appearance", value: "白い毛並み" },
              charaDescription: { name: "chara-description", value: "元気で無邪気" },
            },
          ],
        },
        characterCount: { name: "character-count", value: 2 },
        scenes: {
          name: "scenes",
          children: [
            {
              name: "scene",
              sceneIndex: { name: "scene-index", value: 1 },
              sceneTitle: { name: "scene-title", value: "おかあさんの注意" },
              sceneLocation: { name: "scene-location", value: "ヤギの家の中" },
              sceneTime: { name: "scene-time", value: "昼" },
              sceneCharacters: {
                name: "scene-characters",
                children: [
                  {
                    name: "scene-chara",
                    sceneCharaName: { name: "scene-chara-name", value: "おかあさんヤギ" },
                    sceneCharaAppearance: {
                      name: "scene-chara-appearance",
                      value: "白い毛並み",
                    },
                    sceneCharaDescription: {
                      name: "scene-chara-description",
                      value: "愛情深い母親",
                    },
                    sceneCharaEmotion: { name: "scene-chara-emotion", value: "心配" },
                  },
                ],
              },
              sceneSituation: {
                name: "scene-situation",
                value: "おかあさんヤギが注意している",
              },
              sceneCamera: { name: "scene-camera", value: "アイレベル" },
              sceneColorLighting: { name: "scene-color-lighting", value: "暖色系" },
              sceneNotes: { name: "scene-notes", value: "物語の導入部" },
            },
          ],
        },
        sceneCount: { name: "scene-count", value: 1 },
        keyVisual: {
          name: "key-visual",
          keyVisualTitle: { name: "key-visual-title", value: "救出シーン" },
          keyVisualLocation: { name: "key-visual-location", value: "草原" },
          keyVisualTime: { name: "key-visual-time", value: "昼下がり" },
          keyVisualCharacters: {
            name: "key-visual-characters",
            children: [
              {
                name: "key-visual-chara",
                keyVisualCharaName: { name: "key-visual-chara-name", value: "おかあさんヤギ" },
                keyVisualCharaAppearance: {
                  name: "key-visual-chara-appearance",
                  value: "白い毛並み",
                },
                keyVisualCharaDescription: {
                  name: "key-visual-chara-description",
                  value: "愛情深い母親",
                },
                keyVisualCharaEmotion: { name: "key-visual-chara-emotion", value: "喜び" },
              },
            ],
          },
          keyVisualSituation: { name: "key-visual-situation", value: "感動的な再会シーン" },
          keyVisualCamera: { name: "key-visual-camera", value: "アイレベル" },
          keyVisualColorLighting: {
            name: "key-visual-color-lighting",
            value: "明るく温かい光",
          },
          keyVisualNotes: { name: "key-visual-notes", value: "物語のクライマックス" },
        },
      });
    });

    it("不正なXMLの場合にエラーが発生すること", async () => {
      mockFs.readFileSync = vi.fn().mockReturnValue("不正なXML");
      const result = await repository.getPlan("test_book");
      expect(result).toBeNull();
    });

    it("XML内の数値を正しく変換すること", () => {
      const xmlWithNumbers = `<plan>
<character-count>5</character-count>
<scene-count>10</scene-count>
<scenes>
<scene>
<scene-index>3</scene-index>
</scene>
</scenes>
</plan>`;

      mockFs.readFileSync = vi.fn().mockReturnValue(xmlWithNumbers);
      const result = repository.getPlan("test_book");
      const parseResult = result.then((data: IllustrationPlan | null) => data?.plan?.plan);

      return expect(parseResult).resolves.toMatchObject({
        characterCount: { name: "character-count", value: 5 },
        sceneCount: { name: "scene-count", value: 10 },
        scenes: {
          children: [
            {
              sceneIndex: { name: "scene-index", value: 3 },
            },
          ],
        },
      });
    });

    it("ファイルが存在しない場合はnullを返すこと", async () => {
      mockFs.existsSync = vi.fn().mockReturnValue(false);
      const result = await repository.getPlan("non_existent_book");
      expect(result).toBeNull();
    });

    it("エラーが発生した場合は例外をスローすること", async () => {
      mockFs.readFileSync = vi.fn().mockImplementation(() => {
        throw new Error("Read error");
      });
      await expect(repository.getPlan("test_book")).rejects.toThrow("Read error");
    });
  });
});
