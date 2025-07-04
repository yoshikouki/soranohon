import { describe, expect, it } from "vitest";
import { regex } from "./regex";

describe("Boundary tests for regex.html.ruby.captureBase", () => {
  it("should not match empty string", () => {
    const text = "";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(0);
  });

  it("should not match only <ruby> tag", () => {
    const text = "<ruby></ruby>";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(0);
  });

  it("should match when rb tag is empty", () => {
    const text = "<ruby><rb></rb></ruby>";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(1);
    expect(matches[0][1]).toBe("");
  });

  it("should match when rb tag has one character", () => {
    const text = "<ruby><rb>あ</rb></ruby>";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(1);
    expect(matches[0][1]).toBe("あ");
  });

  it("should match when rb tag is very long", () => {
    const longStr = "ギャル".repeat(1000);
    const text = `<ruby><rb>${longStr}</rb></ruby>`;
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(1);
    expect(matches[0][1]).toBe(longStr);
  });

  it("should capture only the first rb when multiple rb tags exist", () => {
    const text = "<ruby><rb>最初</rb><rb>二番目</rb></ruby>";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(1);
    expect(matches[0][1]).toBe("最初");
  });

  it("should match when rb tag is at the beginning", () => {
    const text = "<ruby><rb>先頭</rb>あとテキスト</ruby>";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(1);
    expect(matches[0][1]).toBe("先頭");
  });

  it("should match when rb tag is at the end", () => {
    const text = "<ruby>テキスト<rb>末尾</rb></ruby>";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(1);
    expect(matches[0][1]).toBe("末尾");
  });

  it("should match all ruby tags when multiple are present", () => {
    const text = "<ruby><rb>ギャル</rb></ruby><ruby><rb>最高</rb></ruby>";
    const matches = [...text.matchAll(regex.html.ruby.captureBase)];
    expect(matches.length).toBe(2);
    expect(matches[0][1]).toBe("ギャル");
    expect(matches[1][1]).toBe("最高");
  });
});

describe("regex.illustrationPlan", () => {
  it("<plan>タグのみ（1行）を抽出できる", () => {
    const text = "<plan>test</plan>";
    const match = text.match(regex.illustrationPlan);
    expect(match).not.toBeNull();
    expect(match?.[0]).toBe("<plan>test</plan>");
  });

  it("<plan>タグが複数行・インデントありでも抽出できる", () => {
    const text = `<plan>\n  <theme>テーマ</theme>\n</plan>`;
    const match = text.match(regex.illustrationPlan);
    expect(match).not.toBeNull();
    expect(match?.[0]).toBe(`<plan>\n  <theme>テーマ</theme>\n</plan>`);
  });

  it("```xmlで始まる場合も抽出できる", () => {
    const text = "```xml\n<plan>\n  <theme>テーマ</theme>\n</plan>\n```\n";
    const match = text.match(regex.illustrationPlan);
    expect(match).not.toBeNull();
    expect(match?.[0]).toBe("<plan>\n  <theme>テーマ</theme>\n</plan>");
  });

  it("<plan>タグが存在しない場合はnull", () => {
    const text = "<theme>テーマ</theme>";
    const match = text.match(regex.illustrationPlan);
    expect(match).toBeNull();
  });
});
