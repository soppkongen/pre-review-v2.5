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

  const orchestrator = new AgentOrchestrator();
  const analysisId = await orchestrator.analyzeDocument(file, summary, reviewMode);
  return NextResponse.json({ analysisId });
}
