# cAIc - Colorado Avalanche Information Center AI Tools

A collection of AI-powered tools for working with Colorado Avalanche Information Center (CAIC) data.

## Project Overview

This monorepo contains applications and packages for accessing, analyzing, and visualizing avalanche information using AI and LLM tools. The project leverages the AI SDK to interact with both local and cloud-based language models.

## Applications

### Tool Calling App

Generates avalanche condition reports using AI with specialized tools that fetch weather forecasts, avalanche danger assessments, and recent accident information.

```bash
npm run start --workspace tool-calling
```

### Report Summaries App

Creates and manages summaries of avalanche reports stored in a database.

## Packages

### @caic/ai-sdk-provider

A simple provider factory for AI SDK that supports both local LLM providers (Ollama) and cloud providers (Gemini).

### @caic/caic

Client for the Colorado Avalanche Information Center API.

### @caic/weather-gov-client

Client for the National Weather Service API.

### @caic/caic-incidents

Client for retrieving avalanche incident reports.

### @caic/caic-report-screenshot

Utilities for generating screenshots of avalanche reports.

## Development

### Setup

```bash
# Install dependencies
npm install
```

### Commands

```bash
# Type check
npm run typecheck

# Run tool calling app
npm run start --workspace tool-calling
```