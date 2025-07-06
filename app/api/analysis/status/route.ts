import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus, getJobResult } from '@/lib/kv-job-queue';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId parameter' }, { status: 400 });
  }
  const status = await getJobStatus(jobId);
  const result = await getJobResult(jobId);
  return NextResponse.json({ jobId, status, result });
} 