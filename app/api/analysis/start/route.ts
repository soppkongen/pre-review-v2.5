import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/real-document-processor';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const summary = formData.get('summary') as string;
  const reviewMode = formData.get('reviewMode') as string;

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  try {
    const resultId = await analyzeDocument(file, summary, reviewMode);
    return NextResponse.json({ resultId });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
