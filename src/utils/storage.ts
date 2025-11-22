import { Habit, HabitPhoto, Reward, Challenge, User, CalendarDay } from '@/types';

const STORAGE_KEYS = {
  HABITS: 'hira_habits',
  PHOTOS: 'hira_photos',
  REWARDS: 'hira_rewards',
  CHALLENGES: 'hira_challenges',
  USER: 'hira_user',
  UNLOCKED_REWARDS: 'hira_unlocked_rewards',
};

// User
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const initializeUser = (): User => {
  const existing = getUser();
  if (existing) {
    // Initialize challenges when user exists
    initializeChallenges();
    return existing;
  }
  
  const newUser: User = {
    id: 'user_1',
    name: 'You',
    totalHira: 0,
    joinedAt: new Date().toISOString(),
    completedChallenges: [],
    hasCompletedOnboarding: false,
  };
  saveUser(newUser);
  // Initialize challenges
  initializeChallenges();
  return newUser;
};

// Habits
export const getHabits = (): Habit[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.HABITS);
  return data ? JSON.parse(data) : [];
};

export const saveHabits = (habits: Habit[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
};

export const addHabit = (habit: Habit): void => {
  const habits = getHabits();
  habits.push(habit);
  saveHabits(habits);
};

export const updateHabit = (habitId: string, updates: Partial<Habit>): void => {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === habitId);
  if (index !== -1) {
    habits[index] = { ...habits[index], ...updates };
    saveHabits(habits);
  }
};

export const deleteHabit = (habitId: string): void => {
  const habits = getHabits().filter(h => h.id !== habitId);
  saveHabits(habits);
};

// Photos
export const getPhotos = (): HabitPhoto[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.PHOTOS);
  return data ? JSON.parse(data) : [];
};

export const savePhotos = (photos: HabitPhoto[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify(photos));
};

export const addPhoto = (photo: HabitPhoto): void => {
  const photos = getPhotos();
  photos.push(photo);
  savePhotos(photos);
};

// Rewards
export const getRewards = (): Reward[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.REWARDS);
  return data ? JSON.parse(data) : getDefaultRewards();
};

export const getDefaultRewards = (): Reward[] => {
  return [
    {
      id: 'cult_fit_10',
      title: 'Cult.fit 10% Off',
      description: 'Get 10% off on your next Cult.fit subscription',
      hiraCost: 50,
      category: 'fitness',
      discountCode: 'HIRA10',
      unlocked: false,
    },
    {
      id: 'kindle_15',
      title: 'Amazon Kindle 15% Off',
      description: '15% discount on Kindle books',
      hiraCost: 75,
      category: 'reading',
      discountCode: 'HIRA15',
      unlocked: false,
    },
    {
      id: 'spotify_1month',
      title: 'Spotify Premium 1 Month',
      description: 'Free 1 month Spotify Premium',
      hiraCost: 100,
      category: 'music',
      discountCode: 'HIRASPOTIFY',
      unlocked: false,
    },
    {
      id: 'udemy_course',
      title: 'Udemy Course 20% Off',
      description: '20% off on any Udemy course',
      hiraCost: 120,
      category: 'learning',
      discountCode: 'HIRA20',
      unlocked: false,
    },
  ];
};

export const saveRewards = (rewards: Reward[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
};

// Challenges
export const getPredefinedChallenges = (): Challenge[] => {
  const today = new Date();
  const endDate30 = new Date(today);
  endDate30.setDate(endDate30.getDate() + 30);
  const endDate21 = new Date(today);
  endDate21.setDate(endDate21.getDate() + 21);
  const endDate7 = new Date(today);
  endDate7.setDate(endDate7.getDate() + 7);

  return [
    {
      id: 'predefined_30day_fitness',
      name: '30-Day Fitness Challenge',
      description: 'Complete a workout every day for 30 days. Build strength, endurance, and consistency!',
      habitName: 'Daily Workout',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate30.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '💪',
    },
    {
      id: 'predefined_21day_reading',
      name: '21-Day Reading Challenge',
      description: 'Read for at least 30 minutes every day. Expand your mind and build a reading habit!',
      habitName: 'Daily Reading',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate21.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '📚',
    },
    {
      id: 'predefined_7day_meditation',
      name: '7-Day Mindfulness Challenge',
      description: 'Meditate for 10 minutes daily. Find peace, reduce stress, and improve focus!',
      habitName: 'Daily Meditation',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate7.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '🧘',
    },
    {
      id: 'predefined_30day_water',
      name: '30-Day Hydration Challenge',
      description: 'Drink 8 glasses of water every day. Stay hydrated and feel energized!',
      habitName: 'Drink Water',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate30.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '💧',
    },
    {
      id: 'predefined_21day_journal',
      name: '21-Day Journaling Challenge',
      description: 'Write in your journal every day. Reflect, grow, and track your progress!',
      habitName: 'Daily Journal',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate21.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '✍️',
    },
    {
      id: 'predefined_30day_walk',
      name: '30-Day Walking Challenge',
      description: 'Walk 10,000 steps every day. Get moving and improve your health!',
      habitName: 'Daily Walk',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate30.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '🚶',
    },
    {
      id: 'predefined_7day_sleep',
      name: '7-Day Sleep Challenge',
      description: 'Get 8 hours of sleep every night. Rest well and wake up refreshed!',
      habitName: 'Quality Sleep',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate7.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '😴',
    },
    {
      id: 'predefined_30day_code',
      name: '30-Day Coding Challenge',
      description: 'Code for at least 1 hour every day. Level up your programming skills!',
      habitName: 'Daily Coding',
      createdBy: 'system',
      createdAt: today.toISOString(),
      endDate: endDate30.toISOString(),
      participants: [],
      photos: [],
      status: 'active',
      isPredefined: true,
      emoji: '💻',
    },
  ];
};

export const initializeChallenges = (): void => {
  if (typeof window === 'undefined') return;
  
  // Get existing challenges directly from localStorage to avoid recursion
  const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
  const existing: Challenge[] = data ? JSON.parse(data) : [];
  const predefined = getPredefinedChallenges();
  
  // Only add predefined challenges if they don't exist
  let hasNewChallenges = false;
  predefined.forEach(predef => {
    const exists = existing.find(c => c.id === predef.id);
    if (!exists) {
      existing.push(predef);
      hasNewChallenges = true;
    }
  });
  
  // Only save if we added new challenges
  if (hasNewChallenges || existing.length === 0) {
    saveChallenges(existing);
  }
};

export const getChallenges = (): Challenge[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CHALLENGES);
  if (!data) {
    // Return empty array if no data - initialization should be called separately
    return [];
  }
  return JSON.parse(data);
};

export const saveChallenges = (challenges: Challenge[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(challenges));
};

export const addChallenge = (challenge: Challenge): void => {
  const challenges = getChallenges();
  challenges.push(challenge);
  saveChallenges(challenges);
};

export const updateChallenge = (challengeId: string, updates: Partial<Challenge>): void => {
  const challenges = getChallenges();
  const index = challenges.findIndex(c => c.id === challengeId);
  if (index !== -1) {
    challenges[index] = { ...challenges[index], ...updates };
    saveChallenges(challenges);
  }
};

// Calendar helpers
export const getCalendarData = (): CalendarDay[] => {
  const habits = getHabits();
  const photos = getPhotos();
  const today = new Date();
  const days: CalendarDay[] = [];
  
  // Get last 30 days - oldest first (for proper calendar alignment)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Count habits completed on this day
    let count = 0;
    habits.forEach(habit => {
      if (habit.completedDates.includes(dateStr)) {
        count++;
      }
    });
    
    // Determine level based on count
    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0) level = 1;
    if (count >= 2) level = 2;
    if (count >= 3) level = 3;
    if (count >= 5) level = 4;
    
    days.push({ date: dateStr, count, level });
  }
  
  return days;
};

// Helper to check if date is today
export const isToday = (dateStr: string): boolean => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

// Helper to format date
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

