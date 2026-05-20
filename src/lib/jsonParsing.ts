export function stripJsonCodeFence(value: string): string {
  return value
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function extractFirstJsonObject(value: string): string | null {
  const content = stripJsonCodeFence(value);
  const start = content.indexOf("{");
  if (start < 0) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < content.length; index += 1) {
    const char = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return content.slice(start, index + 1);
    }
  }

  const lastBrace = content.lastIndexOf("}");
  return lastBrace > start ? content.slice(start, lastBrace + 1) : null;
}

export function parseJsonObject(value: string): Record<string, unknown> | null {
  const stripped = stripJsonCodeFence(value);
  const extracted = extractFirstJsonObject(stripped);
  const candidates = [stripped, extracted].filter((item): item is string => Boolean(item?.trim()));

  for (const candidate of candidates) {
    const cleaned = candidate.trim().replace(/,\s*([}\]])/g, "$1").replace(/\u00A0/g, " ");
    try {
      const parsed = JSON.parse(cleaned) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}
