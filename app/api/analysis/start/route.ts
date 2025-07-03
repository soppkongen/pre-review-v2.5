// app/api/analysis/start/route.ts

// Force Node.js runtime so environment variables load correctly
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { initializeWeaviateClient } from '@/lib/weaviate';
import { DocumentChunk } from './real-document-processor';

const client = initializeWeaviateClient();

export async function POST(request: NextRequest) {
  try {
    // Parse incoming multipart/form-data request
    const form = await request.formData();
    const file = form.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Example: send to Weaviate schema initialization
    await client.schema
      .getter()
      .do()
      .catch(() => {
        throw new Error('Failed to initialize Weaviate schema');
      });

    // Example: further processing (e.g., chunking, embedding)
    // const chunks: DocumentChunk[] = await processDocument(fileBuffer);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in /analysis/start:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
