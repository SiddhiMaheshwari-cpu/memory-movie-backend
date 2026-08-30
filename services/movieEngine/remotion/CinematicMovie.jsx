import React from 'react';
import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';

export const CinematicMovie = ({ audioPath, timestamps, scenePlan }) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#05070a' }}>
      {/* 1. Background Cinematic Voiceover */}
      {audioPath && <Audio src={audioPath} />}

      {/* 2. Map timestamps to visual cuts perfectly on the beat */}
      {timestamps && timestamps.map((timeObj, index) => {
        // Convert exact milliseconds to video frames
        const startFrame = Math.round((timeObj.startMs / 1000) * fps);
        const endFrame = timestamps[index + 1] 
            ? Math.round((timestamps[index + 1].startMs / 1000) * fps) 
            : startFrame + fps; // Fallback for the last word

        return (
          <Sequence key={index} from={startFrame} durationInFrames={Math.max(1, endFrame - startFrame)}>
            <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
               {/* 
                  Later, we will map scenePlan videos here. 
                  For now, we render the exact word with a cinematic glow to test perfect audio sync! 
               */}
              <h1 style={{ 
                color: '#5dd8e2', 
                fontSize: '90px', 
                fontFamily: 'serif', 
                textAlign: 'center',
                textShadow: '0 0 30px rgba(93, 216, 226, 0.6)'
              }}>
                {timeObj.word}
              </h1>
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};