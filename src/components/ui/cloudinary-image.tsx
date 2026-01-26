'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

interface CloudinaryImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: React.ReactNode;
  quality?: 'auto:low' | 'auto:good' | 'auto:best' | number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'crop';
  gravity?: 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
}

export default function CloudinaryImage({
  src,
  alt,
  width = 400,
  height = 400,
  className = '',
  fallback,
  quality = 'auto:good',
  crop = 'fill',
  gravity = 'face'
}: CloudinaryImageProps) {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Jika tidak ada src atau error, tampilkan fallback
  if (!src || imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        {fallback || (
          <User className="h-8 w-8 text-gray-400" />
        )}
      </div>
    );
  }

  // Jika src adalah URL Cloudinary, tambahkan transformasi
  const getOptimizedUrl = (originalUrl: string) => {
    if (originalUrl.includes('cloudinary.com')) {
      // Extract public_id dari URL Cloudinary
      const urlParts = originalUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex !== -1) {
        const publicIdParts = urlParts.slice(uploadIndex + 1);
        const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
        
        // Build transformation URL
        const baseUrl = urlParts.slice(0, uploadIndex + 1).join('/');
        const transformation = `w_${width},h_${height},c_${crop},g_${gravity},q_${quality},f_auto`;
        
        return `${baseUrl}/${transformation}/${publicId}`;
      }
    }
    
    // Jika bukan URL Cloudinary, return as is
    return originalUrl;
  };

  const optimizedUrl = getOptimizedUrl(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <User className="h-8 w-8 text-gray-400" />
        </div>
      )}
      <Image
        src={optimizedUrl}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setImageError(true);
          setLoading(false);
        }}
        quality={75}
        priority={false}
      />
    </div>
  );
}