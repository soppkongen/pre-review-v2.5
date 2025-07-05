export async function analyzeDocument(file: File, summary?: string, reviewMode?: string): Promise<string> {
  const text = await file.text();
  // Her legger du inn faktisk logikk senere
  return `analysis-${Date.now()}`;
}
