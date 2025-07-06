import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { enqueueJob } from '@/lib/kv-job-queue';

export const config = {
  runtime: 'edge',
  maxDuration: 300, // seconds
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paperContent, paperTitle } = body;
    if (!paperContent || !paperTitle) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    const jobId = uuidv4();
    await enqueueJob({
      id: jobId,
      paperContent,
      paperTitle,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, jobId });
  } catch (error) {
    console.error('Failed to enqueue analysis job:', error);
    return NextResponse.json({ error: 'Failed to enqueue analysis job' }, { status: 500 });
  }
}
