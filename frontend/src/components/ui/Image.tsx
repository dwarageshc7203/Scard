import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  priority?: boolean;
  containerClassName?: string;
  disableSkeleton?: boolean;
}

export default function Image({
  src,
  alt,
  className,
  containerClassName,
  fallbackSrc,
  priority = false,
  disableSkeleton = false,
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(!disableSkeleton && !!src);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoading(!disableSkeleton && !!src);
    setIsError(false);
  }, [src, disableSkeleton]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (props.onLoad) props.onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    if (!isError && fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsError(true);
    } else {
      setIsError(true);
    }
    if (props.onError) props.onError(e);
  };

  if (!src && !fallbackSrc) {
    return (
      <div className={`flex items-center justify-center bg-[#222222] text-[#666666] ${className || ''} ${containerClassName || ''}`}>
        <ImageOff className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName || ''} ${className && !className.includes('w-') && !className.includes('h-') ? 'w-full h-full' : ''}`}>
      {/* Skeleton overlay */}
      {isLoading && !disableSkeleton && (
        <div className={`absolute inset-0 bg-[#333333] animate-pulse rounded-[inherit] z-10 ${className || ''}`} />
      )}
      
      {/* Error State */}
      {isError && !fallbackSrc && (
        <div className={`absolute inset-0 flex items-center justify-center bg-[#222222] text-[#666666] rounded-[inherit] z-10 ${className || ''}`}>
          <ImageOff className="w-5 h-5" />
        </div>
      )}

      {/* Actual Image */}
      <img
        src={currentSrc}
        alt={alt || "Image"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className || ''}`}
        {...props}
      />
    </div>
  );
}
