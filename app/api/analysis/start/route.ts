import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/real-document-processor';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const resultId = await analyzeDocument(file);
    return NextResponse.json({ resultId }, { status: 200 });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Document analysis failed' }, { status: 500 });
  }
}
