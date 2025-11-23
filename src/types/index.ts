export interface Habit {
  id: string;
  name: string;
  category?: string;
  emoji?: string; // Selected emoji for the habit
  createdAt: string;
  completedDates: string[]; // ISO date strings
  photos: HabitPhoto[];
  totalHira: number;
  reminderTime?: string; // HH:mm format
  totalDays?: number; // Total days for the habit
  startDate?: string; // ISO date string
  challengeId?: string; // ID of the challenge this habit is from
  priority?: 'Low' | 'Medium' | 'High'; // Priority level
  timesPerDay?: number; // Number of times to complete per day
}

export interface HabitPhoto {
  id: string;
  habitId: string;
  photoData: string; // base64
  timestamp: string;
  date: string; // ISO date string
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  hiraCost: number;
  category: string;
  discountCode?: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  habitName: string;
  createdBy: string;
  createdAt: string;
  endDate: string;
  participants: string[]; // user IDs
  photos: ChallengePhoto[];
  status: 'active' | 'completed' | 'upcoming';
  isPredefined?: boolean; // True for system/predefined challenges
  emoji?: string; // Emoji for the challenge
  category?: string; // Category of the challenge
}

export interface ChallengePhoto {
  id: string;
  challengeId: string;
  userId: string;
  userName: string;
  photoData: string;
  timestamp: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  profilePhoto?: string; // base64 image
  totalHira: number;
  joinedAt: string;
  completedChallenges: string[];
  hasCompletedOnboarding?: boolean;
  age?: number;
  gender?: string;
  collegeOrProfession?: string;
  hobbies?: string[];
}

export interface CalendarDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = no activity, 4 = max activity
}

export interface Friend {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  profilePhoto?: string;
  totalHira: number;
  weeklyHira: number; // Hira earned this week
  tasksDone: number; // Number of tasks completed this week
  challengesDone: number; // Number of challenges completed
  joinedAt: string;
  isSyncedFromContacts: boolean;
}

