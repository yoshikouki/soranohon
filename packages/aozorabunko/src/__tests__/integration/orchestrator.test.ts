import { promises as fs } from "fs";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CLIOptions } from "../../cli";
import { run } from "../../orchestrator";

const tmpDir = path.join(__dirname, "tmp");

beforeEach(async () => {
  await fs.mkdir(tmpDir, { recursive: true });
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("run (Orchestrator)", () => {
  it("reads HTML and writes MDX file", async () => {
    const inputPath = path.join(tmpDir, "test.html");
    const outputPath = path.join(tmpDir, "test.mdx");
    await fs.writeFile(inputPath, "<html><body>Test</body></html>", "utf-8");
    const options: CLIOptions = { input: inputPath, output: outputPath };
    await run(options);
    const mdx = await fs.readFile(outputPath, "utf-8");
    expect(mdx).toBe("Test");
  });
});
