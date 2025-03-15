# Ollama-TS Guidelines

## Commands
- Build/Run: `node --experimental-strip-types src/index.ts`
- Type Check: `tsc --noEmit`
- Run: `node --experimental-strip-types src/index.ts`
- Single Test: `node --experimental-strip-types src/tests/<test-file>`

## Code Style
- **Imports**: Use named imports and follow absolute path imports
- **Types**: Always use proper TypeScript interfaces/types; avoid `any` type
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **Error Handling**: Use try/catch blocks with specific error types
- **Formatting**: 2-space indentation, single quotes, trailing commas
- **Functions**: Prefer arrow functions, explicit return types
- **Comments**: Use JSDoc for public APIs, inline comments for complex logic
- **Async**: Prefer async/await over raw Promises

## API Clients
Write strongly-typed clients with proper error handling and explicit typing.