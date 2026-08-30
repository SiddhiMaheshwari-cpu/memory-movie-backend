import React from 'react';
import { Composition } from 'remotion';
import { CinematicMovie } from './CinematicMovie';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="CinematicMovie"
        component={CinematicMovie}
        durationInFrames={300} // Don't worry, the backend will override this to match exact audio length
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          audioPath: '',
          timestamps: [],
          scenePlan: {}
        }}
      />
    </>
  );
};