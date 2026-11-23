import { useEffect, useState } from "react";

import concertBanner from "../images/concert-banner.png";
import { fetchArtistImage, getCachedArtistImage } from "../../api/artistImages";
import type { Concert } from "../../types/concert";

type ConcertImageProps = {
  concert: Concert;
  className?: string;
  alt?: string;
};

// Stable number from a concert id, used to vary the fallback banner
function hashOf(value: string | number): number {
  let h = 0;
  for (const ch of String(value)) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

// Photo priority: the concert's own image -> artist photo from Deezer ->
// the default banner, color-shifted per concert so fallbacks don't all match.
function ConcertImage({ concert, className = "", alt = concert.name }: ConcertImageProps) {
  const artist = concert.image ? undefined : concert.artist;

  const [lookup, setLookup] = useState<{ artist?: string; url?: string }>(() => ({
    artist,
    url: artist ? (getCachedArtistImage(artist) ?? undefined) : undefined,
  }));

  useEffect(() => {
    if (!artist || getCachedArtistImage(artist) !== undefined) return;
    let active = true;
    fetchArtistImage(artist).then((url) => {
      if (active) setLookup({ artist, url });
    });
    return () => {
      active = false;
    };
  }, [artist]);

  // Ignore a stale result if this component now shows a different artist
  const cached = artist ? getCachedArtistImage(artist) : undefined;
  const artistPhoto =
    cached ?? (lookup.artist === artist ? lookup.url : undefined) ?? undefined;
  const src = concert.image ?? artistPhoto;

  if (src) {
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  }

  const h = hashOf(concert.id);
  return (
    <img
      src={concertBanner}
      alt={alt}
      className={`object-cover ${className}`}
      style={{
        filter: `hue-rotate(${(h % 140) - 70}deg) saturate(${0.9 + (h % 5) * 0.1})`,
        transform: h % 2 ? "scaleX(-1)" : undefined,
      }}
    />
  );
}

export default ConcertImage;
