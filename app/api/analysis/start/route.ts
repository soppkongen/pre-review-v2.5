import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { enqueueJob } from '@/lib/kv-job-queue';

export const config = {
  runtime: 'edge',
  maxDuration: 300, // seconds
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const summary = formData.get('summary');
    // Optionally, you can get reviewMode if needed

    if (!file || typeof summary !== 'string') {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    if (typeof file === 'string') {
      return NextResponse.json({ error: 'File upload failed' }, { status: 400 });
    }

    // Read file content as ArrayBuffer and encode as base64
    let paperContent = '';
    try {
      const arrayBuffer = await file.arrayBuffer();
      paperContent = Buffer.from(arrayBuffer).toString('base64');
    } catch (e) {
      return NextResponse.json({ error: 'Failed to read file content' }, { status: 400 });
    }

    const paperTitle = file.name || 'Untitled';
    const fileType = file.type || 'application/octet-stream';

    const jobId = uuidv4();
    await enqueueJob({
      id: jobId,
      paperContent,
      paperTitle: summary || paperTitle,
      fileName: paperTitle,
      fileType,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    console.error('Failed to enqueue analysis job:', error);
    return NextResponse.json({ error: 'Failed to enqueue analysis job' }, { status: 500 });
  }
}
