export function createId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function titleFromQuestion(question: string): string {
  const clean = question.trim().replace(/\s+/g, " ");
  if (!clean) return "Untitled reflection";
  return clean.length > 52 ? `${clean.slice(0, 49)}...` : clean;
}

export function isProbablyChinese(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}
