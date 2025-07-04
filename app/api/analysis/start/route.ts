// app/api/analysis/start/route.ts

// Force Node.js runtime so environment variables load correctly
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { initializeWeaviateClient } from '@/lib/weaviate';
import { RealAnalysisOrchestrator } from '@/lib/real-analysis-orchestrator';

const client = initializeWeaviateClient();

export async function POST(request: NextRequest) {
  try {
    // Parse incoming multipart/form-data request
    const form = await request.formData();
    const file = form.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const summary = form.get('summary') as string | undefined;
    const reviewMode = form.get('reviewMode') as string | undefined;

    // Start the real analysis and get the analysisId
    const analysisId = await RealAnalysisOrchestrator.analyzeDocument(file, summary, reviewMode);

    return NextResponse.json({ success: true, analysisId });
  } catch (error: any) {
    console.error('Error in /analysis/start:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
