function decodeStreamUrl(raw: string) {
  return raw.replace(/&amp;/g, "&");
}

export async function getBandcampTrackStreamUrl(
  trackUrl: string,
): Promise<string | null> {
  const res = await fetch(trackUrl, { next: { revalidate: 1800 } });
  if (!res.ok) return null;

  const html = await res.text();
  const match = html.match(
    /mp3-128&quot;:&quot;(https:\/\/t4\.bcbits\.com\/stream\/[^&]+(?:&amp;[^&;]+)*)&quot;/,
  );

  if (!match?.[1]) return null;
  return decodeStreamUrl(match[1]);
}
