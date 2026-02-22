/**
 * Extracts Spotify ID from a Spotify URL
 * @param url - Spotify URL (e.g., https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp)
 * @returns Spotify ID or null if not found
 */
export function extractSpotifyId(url: string): string | null {
  if (!url) return null;

  // Match Spotify track URLs
  const matchUrl = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (matchUrl && matchUrl[1]) {
    return matchUrl[1];
  }

  const matchUri = url.match(/spotify:track:([a-zA-Z0-9]+)/);
  if (matchUri && matchUri[1]) {
    return matchUri[1];
  }

  return null;
}
