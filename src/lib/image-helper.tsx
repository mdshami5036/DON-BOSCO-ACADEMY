import React, { useState } from 'react';

/**
 * Universal Image URL Normalizer
 * Converts Google Drive sharing URLs, Dropbox links, and cloud storage links
 * into direct embeddable high-resolution image URLs.
 */
export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Google Drive Link Converter
  // Patterns handled:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/view
  // - https://drive.google.com/file/d/FILE_ID
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // - https://docs.google.com/file/d/FILE_ID
  // - https://drive.google.com/thumbnail?id=FILE_ID
  if (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com')
  ) {
    let fileId = '';

    const matchD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      fileId = matchD[1];
    } else {
      const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (matchId && matchId[1]) {
        fileId = matchId[1];
      } else {
        const matchThumbnail = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (matchThumbnail && matchThumbnail[1]) {
          fileId = matchThumbnail[1];
        }
      }
    }

    if (fileId) {
      // Return Google direct thumbnail CDN endpoint (supports all dimensions, CORS-friendly, no login wall for shared files)
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  }

  // 2. Dropbox Link Converter (dl=0 -> raw=1)
  if (trimmed.includes('dropbox.com')) {
    if (trimmed.includes('?dl=0')) {
      return trimmed.replace('?dl=0', '?raw=1');
    }
    if (trimmed.includes('&dl=0')) {
      return trimmed.replace('&dl=0', '&raw=1');
    }
    if (!trimmed.includes('raw=1')) {
      return trimmed + (trimmed.includes('?') ? '&raw=1' : '?raw=1');
    }
  }

  return trimmed;
}

/**
 * Checks if a string is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Safe Image Component with auto-normalization and fallback on load failure
 */
export interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150',
  alt = 'Image',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const normalizedSrc = normalizeImageUrl(src);

  return (
    <img
      src={hasError || !normalizedSrc ? fallbackSrc : normalizedSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
      {...props}
    />
  );
};
