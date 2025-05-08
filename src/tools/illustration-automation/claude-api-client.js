#!/usr/bin/env node

/**
 * Claude API Client for Illustration Plan Generation
 * 
 * This script takes a prompt file and generates a response using Claude API,
 * then writes the response to the specified output file.
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Validate command line arguments
if (process.argv.length < 4) {
  console.error('Usage: node claude-api-client.js <prompt-file> <output-file>');
  process.exit(1);
}

const promptFile = process.argv[2];
const outputFile = process.argv[3];

// Check if prompt file exists
if (!fs.existsSync(promptFile)) {
  console.error(`Error: Prompt file '${promptFile}' not found`);
  process.exit(1);
}

// Read the prompt
try {
  const prompt = fs.readFileSync(promptFile, 'utf8');
  
  // Try to generate a response using Claude API
  try {
    // Call Claude API (adjust the command as needed for your environment)
    const response = execSync(`echo "${prompt}" | npx @anthropic-ai/claude-api`, { encoding: 'utf8' });
    
    // Write the response to the output file
    fs.writeFileSync(outputFile, response);
    console.log("Success: Claude API response generated");
    process.exit(0);
  } catch (error) {
    console.error("Error: Failed to generate Claude API response", error.message);
    
    // Generate a fallback template
    generateFallbackTemplate(outputFile);
    process.exit(1);
  }
} catch (error) {
  console.error(`Error: Failed to read prompt file: ${error.message}`);
  process.exit(1);
}

/**
 * Generates a fallback template when Claude API fails
 * @param {string} outputFile - Path to the output file
 */
function generateFallbackTemplate(outputFile) {
  console.log("Generating fallback template...");
  
  const template = `# 白雪姫 - 挿絵計画

## 物語の概要
白雪姫は、継母の女王の嫉妬から逃れて森の中で七人の小人たちと暮らすようになります。継母は白雪姫が自分より美しいことを知り、何度も彼女を殺そうとしますが、最終的に王子によって救われます。

## 登場人物
### 白雪姫
**説明**: 主人公の少女。雪のように白い肌と、血のように赤い唇、こくたんのように黒い髪を持つ美しい姫君。
**外見的特徴**:
- 白い肌、赤い唇、黒い髪
- 7歳の少女として描写
- 優しく純粋な表情
**性格特性**:
- 優しく純粋
- 勤勉で家事が得意
- 動物たちにも愛される
**AI画像生成プロンプト案**:
\`\`\`
日本の絵本スタイルの白雪姫、7歳の少女、雪のように白い肌、血のように赤い唇、こくたんのように黒い長い髪、優しい表情、シンプルな白と青の服、森の背景、柔らかい光、温かみのある色調、子供向けの絵本イラスト風
\`\`\`

## 挿絵計画
### 挿絵1: 女王と雪の中の血
**場面**: 物語の始まり、女王が窓辺で裁縫をしていて指を刺し、雪の上に落ちた血を見つめる場面
**行番号**: 1
**登場人物**: 女王（白雪姫の実母）
**場所**: 城の窓辺
**雰囲気**: 静謐、物思いにふける
**視覚的要素**:
- 窓辺に座る女王
- 窓の外の雪景色
- 雪の上に落ちた三滴の血
- こくたんの窓枠のコントラスト
**AI画像生成プロンプト案**:
\`\`\`
日本の絵本スタイル、窓辺で裁縫をする美しい女王、白い雪の景色を背景に、雪の上に落ちた三滴の赤い血、こくたんの黒い窓枠、冬の午後の柔らかい光、物思いにふける表情、白と黒と赤のコントラスト、子供向けの絵本イラスト風
\`\`\`

[他の挿絵については実際の生成時に詳細が追加されます]`;

  fs.writeFileSync(outputFile, template);
  console.log("Fallback template generated");
}