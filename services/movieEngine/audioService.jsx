const { Communicate } = require('edge-tts-universal');
const fs = require('fs/promises');
const path = require('path');

/**
 * Generates cinematic voiceover and word-level timestamps.
 */
async function generateCinematicAudio(scriptText, outputFilename) {
    console.log("🎙️ Initializing Cinematic Audio Generation...");
    
    const tts = new Communicate(scriptText, 'en-US-AriaNeural');
    
    const timestamps = [];
    const audioChunks = [];

    try {
        for await (const chunk of tts.stream()) {
            if (chunk.type === 'audio') {
                audioChunks.push(chunk.data);
            } else if (chunk.type === 'WordBoundary') {
                timestamps.push({
                    word: chunk.text,
                    startMs: chunk.offset / 10000,
                    durationMs: chunk.duration / 10000
                });
            }
        }

        const finalAudioBuffer = Buffer.concat(audioChunks);
        
        // Define the target directory ('public' folder at root level)
        const outputDir = path.join(__dirname, '..', '..', 'public');
        
        // Automatically create the 'public' folder if it doesn't exist
        await fs.mkdir(outputDir, { recursive: true });

        // Save the audio file
        const audioPath = path.join(outputDir, outputFilename); 
        await fs.writeFile(audioPath, finalAudioBuffer);

        console.log(`✅ Audio & Timestamps successfully generated at: ${audioPath}`);
        
        return { 
            audioPath, 
            timestamps 
        };

    } catch (error) {
        console.error("❌ Audio Generation Failed:", error);
        throw error;
    }
}

module.exports = { generateCinematicAudio };