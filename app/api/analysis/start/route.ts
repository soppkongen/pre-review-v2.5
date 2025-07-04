// app/api/analysis/start/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/real-analysis-orchestrator';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const results = await analyzeDocument(buffer);

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error in /analysis/start:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
