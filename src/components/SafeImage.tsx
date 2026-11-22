import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  draggable?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  draggable = true,
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F2EFE9] to-[#E8E1D5] text-[#6B655C] p-6 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-7 h-7 text-[#9A7B3E] mb-2" strokeWidth={1.5} />
        <span className="text-xs font-medium max-w-[18ch] line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      draggable={draggable}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
