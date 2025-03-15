# Ollama-TS Guidelines

## Commands
- Run App: `node --experimental-strip-types apps/tool-calling/index.ts`
- Type Check: `tsc --noEmit`
- Workspace Package Build: `npm run build -w <package-name>`
- Single Test: `node --experimental-strip-types apps/tool-calling/tests/<test-file>`
- Debug: `node --inspect --experimental-strip-types apps/tool-calling/index.ts`

## Code Style
- **Imports**: Use named imports; follow path aliases (@ollama-ts/clients/*)
- **Types**: Strong typing required; avoid `any`; use zod for API validation
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **Error Handling**: try/catch with specific error types; log errors properly
- **Formatting**: 2-space indent, single quotes, trailing commas
- **Functions**: Arrow functions with explicit return types
- **Comments**: JSDoc for APIs, inline comments for complex logic
- **Async**: Prefer async/await over raw Promises
- **Tools**: Use ai-sdk tool pattern with zod schema validation

## API Clients
Create strongly-typed clients with proper error handling and explicit interfaces for all external services.