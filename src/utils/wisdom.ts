const WISDOM_QUOTES = [
  "The journey of a thousand miles begins with a single step.",
  "Success is the sum of small efforts repeated day in and day out.",
  "You don't have to be great to start, but you have to start to be great.",
  "The only way to do great work is to love what you do.",
  "Consistency is the mother of mastery.",
  "Small daily improvements are the key to staggering long-term results.",
  "Your habits shape your identity, and your identity shapes your habits.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Excellence is not a singular act, but a habit.",
  "Progress, not perfection.",
  "The secret of getting ahead is getting started.",
  "Discipline is choosing between what you want now and what you want most.",
  "You are what you repeatedly do. Excellence, then, is not an act, but a habit.",
  "The way to get started is to quit talking and begin doing.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Habits are the compound interest of self-improvement.",
  "The only person you are destined to become is the person you decide to be.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future depends on what you do today.",
  "Every accomplishment starts with the decision to try.",
];

export const getDailyWisdom = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return WISDOM_QUOTES[dayOfYear % WISDOM_QUOTES.length];
};

