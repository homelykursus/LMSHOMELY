'use client';

import { useEffect, useState } from 'react';

interface AlumniAvatar {
  id: number;
  name: string;
  photo: string;
}

export default function AlumniAvatars() {
  const [visibleAvatars, setVisibleAvatars] = useState<number[]>([0, 1, 2, 3, 4]);

  // Data foto alumni
  const alumni: AlumniAvatar[] = [
    { id: 1, name: 'Alumni 1', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400273/s1_ffqhyo.jpg' },
    { id: 2, name: 'Alumni 2', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400272/s2_zdw7a4.jpg' },
    { id: 3, name: 'Alumni 3', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400271/s3_trimcm.jpg' },
    { id: 4, name: 'Alumni 4', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400271/s4_k7vhoc.jpg' },
    { id: 5, name: 'Alumni 5', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400271/s5_kyt19v.jpg' },
    { id: 6, name: 'Alumni 6', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400271/s7_zz60yl.jpg' },
    { id: 7, name: 'Alumni 7', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400271/s8_bnacj3.jpg' },
    { id: 8, name: 'Alumni 8', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400270/s9_hgumcr.jpg' },
    { id: 9, name: 'Alumni 9', photo: 'https://res.cloudinary.com/dzksnkl72/image/upload/v1770400270/s10_xudd8o.jpg' },
  ];

  // Animasi fade in/out
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleAvatars(prev => {
        // Randomly change one avatar
        const randomIndex = Math.floor(Math.random() * 5);
        const newAvatars = [...prev];
        let newAvatarId: number;
        
        do {
          newAvatarId = Math.floor(Math.random() * alumni.length);
        } while (newAvatars.includes(newAvatarId));
        
        newAvatars[randomIndex] = newAvatarId;
        return newAvatars;
      });
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [alumni.length]);

  return (
    <div className="flex flex-col items-center lg:items-start space-y-3">
      {/* Avatar Stack */}
      <div className="flex -space-x-3">
        {visibleAvatars.map((avatarIndex, index) => (
          <div
            key={`${avatarIndex}-${index}`}
            className="relative transition-all duration-500 ease-in-out"
            style={{
              zIndex: 5 - index,
              animation: 'fadeIn 0.5s ease-in-out'
            }}
          >
            <img
              src={alumni[avatarIndex].photo}
              alt={alumni[avatarIndex].name}
              className="w-12 h-12 rounded-full border-3 border-white shadow-lg object-cover"
            />
          </div>
        ))}
      </div>

      {/* Text - Below Photos */}
      <div className="text-center lg:text-left">
        <p className="text-sm md:text-base font-semibold text-gray-900">
          1.500+ Alumni
        </p>
        <p className="text-xs md:text-sm text-gray-600">
          Belajar di Homely
        </p>
      </div>
    </div>
  );
}
