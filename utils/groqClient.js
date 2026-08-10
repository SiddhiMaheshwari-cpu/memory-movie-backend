const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chatCompletion = async (options, retryCount = 0) => {
  try {
    return await groq.chat.completions.create(options);
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const isRateLimit = status === 429;

    if (isRateLimit && retryCount < MAX_RETRIES) {
      const retryAfter =
        Number(error?.headers?.["retry-after"]) ||
        BASE_DELAY_MS * Math.pow(2, retryCount);
      const delayMs = Math.min(retryAfter * 1000, 30000);

      console.warn(
        `Groq rate limit hit. Retry ${retryCount + 1}/${MAX_RETRIES} in ${delayMs}ms`
      );

      await sleep(delayMs);
      return chatCompletion(options, retryCount + 1);
    }

    throw error;
  }
};

const getCompletionText = async (options) => {
  const completion = await chatCompletion(options);
  return completion.choices[0].message.content;
};

module.exports = { groq, chatCompletion, getCompletionText };
