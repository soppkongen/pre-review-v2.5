import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/real-analysis-orchestrator';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const result = await analyzeDocument(file);
  return NextResponse.json(result);
}
