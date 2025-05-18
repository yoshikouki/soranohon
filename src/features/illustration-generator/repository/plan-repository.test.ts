import { beforeEach, describe, expect, it, vi } from "vitest";
import { FileSystem } from "@/lib/fs";
import { IllustrationPlan } from "../types";
import { FilesystemPlanRepository } from "./plan-repository";

describe("FilesystemPlanRepository", () => {
  let repository: FilesystemPlanRepository;
  let mockFs: FileSystem;
  let samplePlanJson: string;

  beforeEach(() => {
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

    samplePlanJson = JSON.stringify({
      theme: "注意深さと機転による危機克服",
      style: "温かみのある手描き風",
      characters: [
        {
          name: "おかあさんヤギ",
          age: "大人",
          sex: "メス",
          appearance: "白い毛並み",
          description: "愛情深く強い母親",
        },
        {
          name: "七ひきの子ヤギ",
          age: "子ども",
          sex: "不明",
          appearance: "白い毛並み",
          description: "元気で無邪気",
        },
      ],
      characterCount: 2,
      scenes: [
        {
          index: 1,
          title: "おかあさんの注意",
          location: "ヤギの家の中",
          time: "昼",
          characters: [
            {
              name: "おかあさんヤギ",
              appearance: "白い毛並み",
              description: "愛情深い母親",
              emotion: "心配",
            },
          ],
          situation: "おかあさんヤギが注意している",
          camera: "アイレベル",
          colorLighting: "暖色系",
          notes: "物語の導入部",
        },
      ],
      sceneCount: 1,
      keyVisual: {
        title: "救出シーン",
        location: "草原",
        time: "昼下がり",
        characters: [
          {
            name: "おかあさんヤギ",
            appearance: "白い毛並み",
            description: "愛情深い母親",
            emotion: "喜び",
          },
        ],
        situation: "感動的な再会シーン",
        camera: "アイレベル",
        colorLighting: "明るく温かい光",
        notes: "物語のクライマックス",
      },
    });
  });

  describe("getPlan", () => {
    it("JSONからIllustrationPlanSchemaを正しく生成できること", () => {
      mockFs.readFileSync = vi.fn().mockReturnValue(samplePlanJson);
      const result = repository.getPlan("test_book");
      const parseResult = result.then((data: IllustrationPlan | null) => data?.plan);

      return expect(parseResult).resolves.toMatchObject({
        theme: "注意深さと機転による危機克服",
        style: "温かみのある手描き風",
        characters: [
          {
            name: "おかあさんヤギ",
            age: "大人",
            sex: "メス",
            appearance: "白い毛並み",
            description: "愛情深く強い母親",
          },
          {
            name: "七ひきの子ヤギ",
            age: "子ども",
            sex: "不明",
            appearance: "白い毛並み",
            description: "元気で無邪気",
          },
        ],
        characterCount: 2,
        scenes: [
          {
            index: 1,
            title: "おかあさんの注意",
            location: "ヤギの家の中",
            time: "昼",
            characters: [
              {
                name: "おかあさんヤギ",
                appearance: "白い毛並み",
                description: "愛情深い母親",
                emotion: "心配",
              },
            ],
            situation: "おかあさんヤギが注意している",
            camera: "アイレベル",
            colorLighting: "暖色系",
            notes: "物語の導入部",
          },
        ],
        sceneCount: 1,
        keyVisual: {
          title: "救出シーン",
          location: "草原",
          time: "昼下がり",
          characters: [
            {
              name: "おかあさんヤギ",
              appearance: "白い毛並み",
              description: "愛情深い母親",
              emotion: "喜び",
            },
          ],
          situation: "感動的な再会シーン",
          camera: "アイレベル",
          colorLighting: "明るく温かい光",
          notes: "物語のクライマックス",
        },
      });
    });

    it("不正なJSONの場合にエラーが発生すること", async () => {
      mockFs.readFileSync = vi.fn().mockReturnValue("不正なJSON");
      const result = await repository.getPlan("test_book");
      expect(result).toBeNull();
    });

    it("JSON内の数値を正しく変換すること", () => {
      const jsonWithNumbers = JSON.stringify({
        characterCount: 5,
        sceneCount: 10,
        scenes: [
          {
            index: 3,
          },
        ],
      });

      mockFs.readFileSync = vi.fn().mockReturnValue(jsonWithNumbers);
      const result = repository.getPlan("test_book");
      const parseResult = result.then((data: IllustrationPlan | null) => data?.plan);

      return expect(parseResult).resolves.toMatchObject({
        characterCount: 5,
        sceneCount: 10,
        scenes: [
          {
            index: 3,
          },
        ],
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
