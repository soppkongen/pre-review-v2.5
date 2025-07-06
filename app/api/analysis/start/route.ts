import { NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/services/agent-orchestrator';
import { AnalysisStorage } from '@/lib/kv-storage';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  runtime: 'edge',
  maxDuration: 300, // seconds
};

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File;
  const summary = form.get('summary') as string | undefined;
  const reviewMode = (form.get('reviewMode') as string) || 'full';

  // Generate a new analysis ID and persist initial state
  const analysisId = uuidv4();
  await AnalysisStorage.store(analysisId, {
    analysisId,
    documentName: file.name,
    reviewMode,
    summary,
    status: 'processing',
    timestamp: new Date().toISOString(),
  });

  // Execute the full analysis pipeline synchronously
  const orchestrator = new AgentOrchestrator();
  await orchestrator.processDocumentAsync(analysisId, file, summary, reviewMode);

  // Return the ID only after processing completes
  return NextResponse.json({ analysisId });
}
