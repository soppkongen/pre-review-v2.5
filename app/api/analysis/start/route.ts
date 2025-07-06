import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/lib/services/agent-orchestrator';

// ADD THESE LINES AT THE TOP
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const summary = formData.get('summary') as string;
  const reviewMode = formData.get('reviewMode') as string;

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  try {
    const orchestrator = new AgentOrchestrator();
    const analysisId = await orchestrator.analyzeDocument(file, summary, reviewMode);
    return NextResponse.json({ analysisId });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
