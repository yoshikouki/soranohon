# Soranohon - Claude Helper

## Principles

- Use immutable data structures
- Separate side effects
- Ensure type safety

### Test-Driven Development (TDD)

- Red-Green-Refactor cycle
- Treat tests as specifications
- Iterate in small units
- Continuous refactoring

## Build & Development Commands
```bash
bun run dev          # Start dev server (PORT=8888, Turbopack)
bun run build        # Build production version
bun run start        # Start production server
bun run convertToUTF8:all  # Convert all files to UTF-8
```

## Test Commands
```bash
bun run test         # Run all tests
bun run test:watch   # Run tests in watch mode
bun run build:test   # Another way to run tests
bun run test -- src/path/to/file.test.ts  # Run single test file
bun run test -- src/path/to/file.test.ts -t "test description"  # Run specific test
```

## Lint & Format Commands
```bash
bun run lint         # Check code with Biome
bun run lint:next    # Check with Next.js linter
bun run format       # Auto-format with Biome
bun run format:unsafe  # Format with unsafe rules
```

## Project Structure
- **Architecture**: "Package by Feature" architecture
- **App Router** (`src/app/`): Next.js pages, layouts, and routing
- **Features** (`src/features/`): Business logic organized by feature
- **Components** (`src/components/`): Shared UI components
- **Libraries** (`src/lib/`): Shared utilities and configurations

## Package by Feature Guidelines
- Feature directories in `src/features/` should be self-contained
- Feature-specific components in `features/[feature]/components/`
- Shared components in `src/components/`
- Business logic should be separate from UI components
- Avoid cross-feature dependencies

## File Naming & Organization
- **File Naming**: kebab-case for all files (e.g., `login-button.tsx`)
- **React Components**: component file, test file, component-specific utilities
- **Path Aliases**: `@/*` maps to `src/*`
- **Imports**: Group by 1) external deps, 2) shared modules, 3) feature imports

## Code Style
- **Formatting**: 2 spaces, 96 char line width, double quotes
- **TypeScript**: Strict typing, explicit return types
- **Functions**: JSDoc comments for public functions
- **Naming**: camelCase for variables/functions, descriptive names
- **Tests**: Use describe/it blocks, test edge cases
- **Error Handling**: Early returns, explicit error messages
- **Imports**: Organized by Biome, named exports preferred, direct imports only
- **Barrel Files**: NEVER use index.ts for re-exporting - import directly from source files
- **Dead Code**: Promptly remove unused functions, files, and tests

## Testing & Verification
- Tests should be co-located with the code they test
- Always verify code changes at http://localhost:8888 using Playwright MCP browser
- Use Claude's MCP browser feature to interact with the application visually
- Manual testing can be skipped if automated tests exist
- Run tests with `bun run test` or `bun run build:test`
