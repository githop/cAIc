# Avalanche Report Summaries

A tool for fetching, storing, and generating AI summaries of avalanche reports from the Colorado Avalanche Information Center.

## Project Description

This application captures avalanche reports, stores them in a SQLite database (via LibSQL/Turso), and generates markdown summaries using AI vision models. It can process new reports automatically and regenerate summaries as needed.

## Features

- Automatically fetches new avalanche reports from CAIC
- Takes screenshots of report pages
- Generates markdown summaries using vision models (Gemma, Gemini)
- Stores reports and summaries in a database with timestamps
- Supports different prompt templates for summary generation
- Can regenerate summaries for existing reports

## Scripts

```bash
# Sync new reports from CAIC
npm run sync

# Insert a new prompt template (requires kind, model, and text arguments)
npm run insert-prompt -- system gemini-flash "Your prompt text"

# Regenerate all summaries (requires promptId argument)
# Optional flags: --batch-size=<number> --concurrency=<number> --requests-per-minute=<number>
npm run regenerate-summaries -- prmpt_123456789ABCDEF

# Regenerate a single summary (requires reportId and promptId arguments)
npm run regenerate-summary -- rep_123456789ABCDEF prmpt_123456789ABCDEF
```

## Database Schema

The application uses a SQLite database with the following tables:

- **reports**: Stores report metadata (ID, URL, timestamp)
- **report_contents**: Stores generated summaries with references to reports and prompts
- **prompts**: Stores prompt templates used for summarization

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URL`: URL for the SQLite/Turso database
- `DEFAULT_PROMPT_ID`: ID of the default prompt to use for summaries

## Dependencies

- Drizzle ORM for database interactions
- AI SDK for model integration
- LibSQL client for database connectivity
- CAIC report screenshot package for capturing report pages
