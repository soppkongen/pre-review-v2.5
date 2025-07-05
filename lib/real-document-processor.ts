export async function analyzeDocument(file: File, summary?: string, reviewMode?: string): Promise<string> {
  const text = await file.text();
  // Midlertidig dummy-ID
  return `dummy-${Date.now()}`;
}
