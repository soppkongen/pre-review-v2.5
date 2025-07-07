# pre-review v2.5

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/silentsavage/v0-pre-review-v2-5)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/xN5fcwiBchN)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/silentsavage/v0-pre-review-v2-5](https://vercel.com/silentsavage/v0-pre-review-v2-5)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/xN5fcwiBchN](https://v0.dev/chat/projects/xN5fcwiBchN)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

# Scientific Paper Analysis System: Agent & Worker Architecture

## Agent System

Each agent implements the following interface:

```ts
export interface AgentResult {
  agentName: string;
  role: string;
  confidence: number;
  findings: string[];
  recommendations: string[];
  durationMs: number;
}
```

Agents are implemented as async functions that accept `{ text: string, context?: string[] }` and return an `AgentResult`. Example agents include theoretical, mathematical, and epistemic reviewers.

## Agent Orchestrator

The `AgentOrchestrator` class coordinates running all agents on all document chunks. It:
- Accepts a File-like object (with `.name`, `.type`, and `.text()` method)
- Chunks the document
- Runs all registered agents on each chunk
- Aggregates results (findings, recommendations, confidences)
- Stores results in Redis for API retrieval

## Worker Process

The worker process runs independently and:
- Polls the Redis job queue for new jobs
- Reconstructs a File-like object from the job's base64 content, name, and type
- Passes the file to the `AgentOrchestrator` for analysis
- Stores the aggregated results and updates job status
- Logs progress and errors for observability

## Job Object Structure

Jobs enqueued to the system must include:
- `id`: Unique job ID
- `paperContent`: Base64-encoded document content
- `fileName`: Original file name
- `fileType`: MIME type
- `createdAt`: Timestamp

## Extending the System

To add a new agent:
1. Implement the agent function with the required interface
2. Register the agent in `RealOpenAIAgents` and the orchestrator

To add new analysis types or outputs, update the orchestrator's aggregation logic and result schema.
