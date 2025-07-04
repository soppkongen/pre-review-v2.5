export async function readFileAsText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return new TextDecoder('utf-8').decode(buffer);
}
 
