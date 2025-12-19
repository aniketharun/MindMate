const EMOTIONS = ["happy", "sad", "angry", "anxious", "neutral"];

const keywordMap = {
  happy: ["happy", "grateful", "excited", "good", "joy", "content"],
  sad: ["sad", "down", "depressed", "unhappy", "hopeless", "cry"],
  angry: ["angry", "mad", "furious", "irritated", "rage", "annoyed"],
  anxious: ["anxious", "worried", "nervous", "panic", "overwhelmed", "scared"],
};

export const detectEmotion = (text) => {
  if (!text || !text.trim()) {
    return { emotion: "neutral", confidence: 0.5 };
  }

  const lower = text.toLowerCase();
  const scores = { happy: 0, sad: 0, angry: 0, anxious: 0 };

  Object.entries(keywordMap).forEach(([emotion, keywords]) => {
    keywords.forEach((k) => {
      if (lower.includes(k)) {
        scores[emotion] += 1;
      }
    });
  });

  let topEmotion = "neutral";
  let topScore = 0;
  Object.entries(scores).forEach(([emotion, score]) => {
    if (score > topScore) {
      topScore = score;
      topEmotion = emotion;
    }
  });

  if (topScore === 0) {
    return { emotion: "neutral", confidence: 0.6 };
  }

  const confidence = Math.min(0.9, 0.5 + topScore * 0.1);
  return { emotion: topEmotion, confidence };
};




