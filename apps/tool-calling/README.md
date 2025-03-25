# Avalanche Tool Calling

An interactive CLI application that provides avalanche safety information using AI tools.

## Overview

This application demonstrates AI SDK tool calling capabilities by providing a conversational interface for retrieving:

1. Weather forecasts
2. Avalanche danger forecasts
3. Recent avalanche incidents and accidents

The application integrates with the Colorado Avalanche Information Center (CAIC) API and the National Weather Service API to provide real-time, location-specific information.

## Features

- Interactive command-line interface
- Support for multiple LLM providers (Ollama local models and Gemini cloud models)
- Specialized tools for various avalanche and weather information sources
- Location-based forecasts using latitude/longitude coordinates

## Tools

- **Weather Forecast Tool**: Retrieves current weather conditions for a specific location using the National Weather Service API
- **Avalanche Danger Forecast Tool**: Fetches avalanche danger levels and regional conditions for a specific location
- **Recent Avalanche Accidents Tool**: Provides reports of recent avalanche incidents and accidents in Colorado

## Usage

### Starting the Interactive CLI

```bash
# Use Ollama (local LLM)
npm run start -- ollama

# Use Gemini (cloud LLM)
npm run start -- gemini
```

### Example Queries

Once the CLI is running, you can ask questions like:

- "What's the weather forecast for Breckenridge, Colorado? The coordinates are approximately 39.48, -106.04."
- "What's the avalanche danger near Loveland Pass? The coordinates are 39.68, -105.88."
- "Tell me about recent avalanche accidents in Colorado."

### Generate a Report

```bash
# Generate a markdown report of recent avalanche incidents
npm run write
```

## Environment Variables

Create a `.env` file with the following variables:

```
# For Gemini model (required if using gemini option)
API_KEY_GEMINI=your_gemini_api_key
```

## Dependencies

- AI SDK for tool calling framework
- Zod for parameter validation
- CAIC client packages for avalanche data
- Weather.gov client for forecast data