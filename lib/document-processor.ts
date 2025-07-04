export async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}
