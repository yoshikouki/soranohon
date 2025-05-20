# AI Agents Guide

This file provides common context and guidelines for AI agents (e.g., Codex CLI, Claude)
working on this repository. The agent will read this file to understand how to navigate the codebase
and follow project conventions.

## Overview

- **Project**: soranohon (青空文庫の児童文学読書サービス)
- **Important files & folders**:
  - `src/app/` — Next.js App Router pages and layouts
  - `src/features/` — Business logic and components organized by feature
  - `src/components/` — Shared UI components
  - `src/lib/` — Shared utilities and configurations
  - `docs/` — 要件定義、進捗管理、ロードマップなどのドキュメント
  - `README.md` — Project overview and directory structure
  - `CLAUDE.md` — Coding principles and CLI commands

## Coding Guidelines

Refer to `CLAUDE.md` for coding principles, file naming conventions, import rules, and code style.

## Dev Environment Tips

- `pnpm run dev` — Start development server (PORT=8888, Turbopack)
- `pnpm run build` — Build production version
- `pnpm run start` — Start production server

## Testing Instructions

- Find the CI plan in `.github/workflows` folder.
- `pnpm run test` — Run all tests (Vitest)
- `pnpm run test:watch` — Run tests in watch mode
- `pnpm run build:test` — Run tests in build mode

## Lint & Format

- `pnpm run lint` — Run Biome for code checks
- `pnpm run format` — Auto-format with Biome
- `pnpm run format:unsafe` — Format to sort classNames
