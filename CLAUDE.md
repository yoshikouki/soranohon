# Soranohon - Claude Helper

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

## Code Style
- **Formatting**: 2 spaces, 96 char line width, double quotes
- **TypeScript**: Strict typing, explicit return types
- **Functions**: JSDoc comments for public functions
- **Naming**: camelCase for variables/functions, descriptive names
- **Tests**: Use describe/it blocks, test edge cases
- **Error Handling**: Early returns, explicit error messages
- **Imports**: Organized by Biome, named exports preferred