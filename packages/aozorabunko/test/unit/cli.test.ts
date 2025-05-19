import { describe, expect, it } from "vitest";
import { CLIOptions, parseCLIOptions } from "../../src/cli";

describe("parseCLIOptions", () => {
  it("入力パスのみの場合、outputはundefinedとなる", () => {
    const options: CLIOptions = parseCLIOptions(["input.html"]);
    expect(options).toEqual({ input: "input.html", output: undefined });
  });

  it("-o オプションで出力パスを指定できる", () => {
    const options = parseCLIOptions(["-o", "out.mdx", "in.html"]);
    expect(options).toEqual({ input: "in.html", output: "out.mdx" });
  });

  it("--output オプションでも同様に動作する", () => {
    const options = parseCLIOptions(["--output", "result.mdx", "source.html"]);
    expect(options).toEqual({ input: "source.html", output: "result.mdx" });
  });

  it("入力パスの後ろにオプションを置いても認識できる", () => {
    const options = parseCLIOptions(["source.html", "-o", "output.mdx"]);
    expect(options).toEqual({ input: "source.html", output: "output.mdx" });
  });
});
