export function getSafeExternalUrl(value: string | undefined | null) {
  const url = value?.trim();

  if (!url) {
    return "";
  }

  try {
    const parsed = new URL(url);

    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : "";
  } catch {
    return "";
  }
}
