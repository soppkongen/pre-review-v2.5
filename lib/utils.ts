export function cn(...inputs: Array<string | undefined | false | null>): string {
  return inputs.filter(Boolean).join(" ");
}
