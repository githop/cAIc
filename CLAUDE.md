# cAIc Guidelines

## Commands

- Run App: `npm run start --workspace tool-calling`
- Type Check: `npm run typecheck`

## Code Style

- **Imports**: Use named imports; follow path aliases (@caic/\*)
- **Types**: Strong typing required; avoid `any`; use zod for API validation
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces
- **Error Handling**: try/catch with specific error types; log errors properly
- **Formatting**: 2-space indent, single quotes, trailing commas
- **Functions**: Named functions
- **Comments**: JSDoc for APIs, inline comments for complex logic
- **Async**: Prefer async/await over raw Promises
- **Tools**: Use ai-sdk tool pattern with zod schema validation

## API Clients

Create strongly-typed clients with proper error handling and explicit interfaces for all external services.
