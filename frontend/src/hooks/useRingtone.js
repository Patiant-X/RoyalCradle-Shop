// useRingtone.js
import { useEffect, useRef } from 'react';

const useRingtone = (ringtoneSrc, duration = 25000) => {
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playRingtone = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(ringtoneSrc);
    }
    audioRef.current.loop = true;
    audioRef.current.play();

    intervalRef.current = setTimeout(() => {
      audioRef.current.pause();
      clearInterval(intervalRef.current);
    }, duration);
  };

  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    clearTimeout(intervalRef.current);
  };

  return { playRingtone, stopRingtone };
};

export default useRingtone;
