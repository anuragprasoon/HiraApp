import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { PhotoIcon, ShareIcon, UserIcon, ArrowDownTrayIcon, XMarkIcon, ArrowUpTrayIcon, PencilIcon, TrophyIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { getUser, getHabits, getPhotos, getCalendarData, getChallenges, formatDate, saveUser } from '@/utils/storage';
import { User, Habit, HabitPhoto, CalendarDay, Challenge } from '@/types';
import SocialShareTemplate from '@/components/SocialShareTemplate';
import { getDailyWisdom } from '@/utils/wisdom';
import { generateCalendarImage } from '@/utils/calendarShare';
import { useRouter } from 'next/router';
import CameraCapture from '@/components/CameraCapture';
import { sounds } from '@/utils/sounds';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [photos, setPhotos] = useState<HabitPhoto[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<{ habit: Habit; photo: HabitPhoto } | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'challenges'>('calendar');
  const [showCameraForDP, setShowCameraForDP] = useState(false);

  useEffect(() => {
    const userData = getUser();
    if (!userData) return;
    
    setUser(userData);
    setHabits(getHabits());
    setPhotos(getPhotos());
    setCalendarData(getCalendarData());
    setChallenges(getChallenges());
  }, []);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
          <p className="text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  const getIntensityColor = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100';
      case 1: return 'bg-blue-200';
      case 2: return 'bg-blue-300';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-blue-500';
      default: return 'bg-gray-100';
    }
  };
  const userPhotos = photos.map(photo => {
    const habit = habits.find(h => h.id === photo.habitId);
    return { habit, photo };
  }).filter(item => item.habit) as { habit: Habit; photo: HabitPhoto }[];

  const acceptedChallenges = challenges.filter(c => 
    user && c.participants.includes(user.id)
  );

  // Calculate leaderboard position for each challenge
  const getChallengeLeaderboardPosition = (challenge: Challenge): { rank: number; hiraPoints: number; totalParticipants: number } => {
    if (!user) return { rank: 0, hiraPoints: 0, totalParticipants: 0 };

    const habits = getHabits();
    const allUsers = [getUser()].filter(Boolean) as User[];
    
    // Get all participants' data
    const entries: Array<{ userId: string; hiraPoints: number }> = [];
    
    challenge.participants.forEach((participantId) => {
      const participantUser = allUsers.find(u => u.id === participantId);
      if (!participantUser) return;

      // Find the habit associated with this challenge for this participant
      const challengeHabit = habits.find(
        h => h.challengeId === challenge.id
      );

      const hiraPoints = challengeHabit?.totalHira || 0;
      entries.push({ userId: participantId, hiraPoints });
    });

    // Sort by Hira points (descending)
    entries.sort((a, b) => b.hiraPoints - a.hiraPoints);

    // Find current user's rank
    let userRank = 0;
    let userHiraPoints = 0;
    
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].userId === user.id) {
        userHiraPoints = entries[i].hiraPoints;
        // Handle ties - if previous entry has same points, use same rank
        if (i > 0 && entries[i - 1].hiraPoints === entries[i].hiraPoints) {
          // Find the first entry with this score
          let rank = i;
          for (let j = i - 1; j >= 0; j--) {
            if (entries[j].hiraPoints === entries[i].hiraPoints) {
              rank = j;
            } else {
              break;
            }
          }
          userRank = rank + 1;
        } else {
          userRank = i + 1;
        }
        break;
      }
    }

    return { 
      rank: userRank, 
      hiraPoints: userHiraPoints, 
      totalParticipants: entries.length 
    };
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const dailyWisdom = getDailyWisdom();
  const totalHabitsCompleted = habits.reduce((sum, habit) => sum + habit.completedDates.length, 0);
  const totalPhotos = photos.length;
  const daysActive = new Set(habits.flatMap(h => h.completedDates)).size;

  // Calculate streak (longest consecutive days with at least one habit completed)
  const calculateStreak = (): number => {
    if (habits.length === 0) return 0;
    
    const allCompletedDates = new Set(habits.flatMap(h => h.completedDates));
    if (allCompletedDates.size === 0) return 0;
    
    const sortedDates = Array.from(allCompletedDates).sort();
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  // Calculate skipped days (days that should have been completed but weren't)
  const calculateSkipped = (): number => {
    if (habits.length === 0) return 0;
    
    const today = new Date();
    const allStartDates = habits.map(h => h.startDate ? new Date(h.startDate) : new Date(h.createdAt));
    const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())));
    
    const allCompletedDates = new Set(habits.flatMap(h => h.completedDates));
    let skipped = 0;
    
    for (let d = new Date(earliestStart); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const hasActiveHabit = habits.some(h => {
        if (!h.startDate) return true;
        const startDate = new Date(h.startDate);
        const endDate = h.totalDays ? new Date(startDate.getTime() + h.totalDays * 24 * 60 * 60 * 1000) : today;
        return d >= startDate && d <= endDate;
      });
      
      if (hasActiveHabit && !allCompletedDates.has(dateStr)) {
        skipped++;
      }
    }
    
    return skipped;
  };

  // Calculate weekly activity for chart
  const getWeeklyActivity = () => {
    const weeks: { week: number; percentage: number }[] = [];
    const today = new Date();
    const allCompletedDates = new Set(habits.flatMap(h => h.completedDates));
    
    // Get last 5 weeks
    for (let weekNum = 1; weekNum <= 5; weekNum++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (5 - weekNum) * 7);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      
      let completedDays = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(weekStart);
        checkDate.setDate(weekStart.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (allCompletedDates.has(dateStr)) {
          completedDays++;
        }
      }
      
      weeks.push({
        week: weekNum,
        percentage: Math.round((completedDays / 7) * 100)
      });
    }
    
    return weeks;
  };

  const streak = calculateStreak();
  const skipped = calculateSkipped();
  const weeklyActivity = getWeeklyActivity();

  const handleShareCalendar = async () => {
    const imageData = await generateCalendarImage(calendarData, user);
    if (imageData) {
      // Create download link
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `hira-calendar-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    }
  };

  const handleShareCalendarSocial = async (platform: 'twitter' | 'whatsapp' | 'instagram') => {
    const imageData = await generateCalendarImage(calendarData, user);
    if (!imageData) return;

    const text = `Check out my Hira activity calendar! I've earned ${user.totalHira} Hira so far! 💎 #HiraApp`;
    
    if (platform === 'twitter') {
      // For Twitter, we'll need to upload the image first, but for now just share text
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'whatsapp') {
      // WhatsApp doesn't support direct image sharing via URL, so we'll share text
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'instagram') {
      // Instagram requires the app, so we'll download the image for user to upload
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `hira-calendar-story.png`;
      link.click();
      alert('Image downloaded! Open Instagram Stories and upload this image.');
    }
  };

  const handleProfilePhotoCapture = (photoData: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      profilePhoto: photoData,
    };
    saveUser(updatedUser);
    setUser(updatedUser);
    setShowCameraForDP(false);
    sounds.success();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 pb-24">
        <div className="max-w-2xl mx-auto bg-white min-h-screen pb-24">
          {/* Header Section */}
          <div className="relative pt-12 pb-6 px-4">
            <div className="flex items-start justify-end mb-4">
              <button 
                onClick={() => {
                  router.push('/');
                }}
                className="p-2 hover:bg-gray-100 full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-3">
                {user.profilePhoto ? (
                  <div className="w-20 h-20 2xl overflow-hidden border-2 border-orange-200 shadow-md">
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-md">
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowCameraForDP(true);
                  }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-500 full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                >
                  <PencilIcon className="w-4 h-4 text-white" />
                </button>
              </div>
              <h1 className="text-2xl text-black text-center mb-2">
                {user.name}
              </h1>
                <p className="text-sm text-[#666666] text-center" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                  Rise Above Limits
                </p>
            </div>
          </div>

          <div className="px-4 space-y-4 pb-6">
            {/* Profile Information Card */}
            {(user.age || user.gender || user.collegeOrProfession || (user.hobbies && user.hobbies.length > 0)) && (
              <div className="bg-white 2xl p-5 shadow-sm border border-gray-200">
                <h3 className="text-sm text-[#666666] uppercase tracking-wider font-normal mb-4">Profile Information</h3>
                <div className="space-y-3">
                  {user.age && (
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎂</span>
                      <div>
                        <p className="text-xs text-gray-500">Age</p>
                        <p className="text-sm font-medium text-gray-900">{user.age} years old</p>
                      </div>
                    </div>
                  )}
                  {user.gender && (
                    <div className="flex items-center gap-3">
                      <span className="text-lg">👤</span>
                      <div>
                        <p className="text-xs text-gray-500">Gender</p>
                        <p className="text-sm font-medium text-gray-900">{user.gender}</p>
                      </div>
                    </div>
                  )}
                  {user.collegeOrProfession && (
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🎓</span>
                      <div>
                        <p className="text-xs text-gray-500">College / Profession</p>
                        <p className="text-sm font-medium text-gray-900">{user.collegeOrProfession}</p>
                      </div>
                    </div>
                  )}
                  {user.hobbies && user.hobbies.length > 0 && (
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🎨</span>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-2">Hobbies</p>
                        <div className="flex flex-wrap gap-2">
                          {user.hobbies.map((hobby, index) => (
                            <span
                              key={index}
                              className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 xl text-xs font-medium text-blue-700"
                            >
                              {hobby}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Statistics Card */}
            <div className="bg-white 2xl p-5 shadow-sm border border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{streak}</p>
                  <p className="text-xs text-gray-500">Streak</p>
                  <p className="text-xs text-gray-400 mt-0.5">Days</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{daysActive}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-xs text-gray-400 mt-0.5">Days</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{skipped}</p>
                  <p className="text-xs text-gray-500">Skipped</p>
                  <p className="text-xs text-gray-400 mt-0.5">Days</p>
                </div>
              </div>
            </div>


            {/* Tabs */}
            <div className="flex gap-2 mb-4 bg-gray-100 p-1 xl">
              <button
                onClick={() => {
                  setActiveTab('calendar');
                }}
                className={`flex-1 px-4 py-2.5 lg font-medium transition-all text-sm ${
                  activeTab === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => {
                  setActiveTab('challenges');
                }}
                className={`flex-1 px-4 py-2.5 lg font-medium transition-all text-sm ${
                  activeTab === 'challenges'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Challenges ({acceptedChallenges.length})
              </button>
            </div>

            {/* Calendar View */}
            {activeTab === 'calendar' && (
              <div className="space-y-4">
                {/* Share Calendar Options */}
                <div className="bg-white 2xl p-5 shadow-sm border border-gray-200">
                  <h4 className="text-black mb-3 flex items-center gap-2">
                    <ShareIcon className="w-5 h-5 text-[#0066ff]" />
                    Share Your Calendar
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleShareCalendarSocial('instagram')}
                      className="py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white xl font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </button>
                    <button
                      onClick={() => handleShareCalendarSocial('twitter')}
                      className="py-3 bg-gradient-to-br from-blue-400 to-cyan-500 text-white xl font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShareCalendarSocial('whatsapp')}
                      className="py-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white xl font-medium hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </button>
                  </div>
                </div>

                <div className="bg-white 2xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-[#666666] uppercase tracking-wider font-normal">30-Day Activity Calendar</h3>
                    <button
                      onClick={handleShareCalendar}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white lg hover:bg-blue-600 transition-all text-sm font-medium"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2 max-w-md mx-auto">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-[10px] text-gray-500 text-center py-0.5 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1 max-w-md mx-auto">
                    {(() => {
                      if (calendarData.length === 0) return null;
                      
                      // Reverse the calendar data to show most recent days first
                      const reversedData = [...calendarData].reverse();
                      
                      // Get the first day (most recent, which is now first in reversed array)
                      const firstDayStr = reversedData[0].date;
                      const firstDay = new Date(firstDayStr + 'T00:00:00');
                      const startDayOfWeek = firstDay.getDay();
                      
                      // Build cells array with proper alignment
                      const cells: (CalendarDay | null)[] = [];
                      // Add empty cells before the first day to align with day-of-week
                      for (let i = 0; i < startDayOfWeek; i++) {
                        cells.push(null);
                      }
                      // Add all reversed days (most recent first)
                      cells.push(...reversedData);
                      
                      return cells.map((day, idx) => {
                        if (!day) {
                          return <div key={`empty-${idx}`} className="aspect-square" />;
                        }
                        
                        const isToday = day.date === new Date().toISOString().split('T')[0];
                        const dayDate = new Date(day.date + 'T00:00:00');
                        const dayOfWeek = dayDate.getDay();
                        
                        return (
                          <div
                            key={day.date}
                            className={`aspect-square rounded ${getIntensityColor(day.level)} cursor-pointer hover:scale-110 transition-transform relative ${
                              isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                            }`}
                            title={`${day.date} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}): ${day.count} habit${day.count !== 1 ? 's' : ''} completed`}
                          >
                            {isToday && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-gray-500 max-w-md mx-auto">
                    <span>Less</span>
                    <div className="flex gap-0.5">
                      <div className="w-2 h-2 rounded bg-gray-100"></div>
                      <div className="w-2 h-2 rounded bg-blue-200"></div>
                      <div className="w-2 h-2 rounded bg-blue-300"></div>
                      <div className="w-2 h-2 rounded bg-blue-400"></div>
                      <div className="w-2 h-2 rounded bg-blue-500"></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </div>
            )}

            {/* Challenges View */}
            {activeTab === 'challenges' && (
              <div>
                {acceptedChallenges.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 full bg-gray-100 mb-4">
                      <span className="text-4xl">💎</span>
                    </div>
                    <h3 className="text-lg text-black mb-2">No challenges yet</h3>
                    <p className="text-gray-600 text-sm">Join challenges to see them here!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {acceptedChallenges.map((challenge) => {
                      const leaderboardData = getChallengeLeaderboardPosition(challenge);
                      const medal = getMedalEmoji(leaderboardData.rank);
                      
                      return (
                        <div
                          key={challenge.id}
                          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => router.push(`/challenge/${challenge.id}`)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg text-black font-semibold">{challenge.name}</h3>
                                {challenge.emoji && <span className="text-xl">{challenge.emoji}</span>}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{challenge.habitName}</span>
                                <span>•</span>
                                <span>Ends {formatDate(challenge.endDate)}</span>
                              </div>
                            </div>
                            <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              challenge.status === 'active' ? 'bg-green-100 text-green-600' :
                              challenge.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {challenge.status}
                            </div>
                          </div>

                          {/* Leadership Position */}
                          {leaderboardData.rank > 0 && (
                            <div className={`mb-3 p-3 rounded-xl border-2 ${
                              leaderboardData.rank === 1 
                                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' 
                                : leaderboardData.rank === 2
                                ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
                                : leaderboardData.rank === 3
                                ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
                                : 'bg-blue-50 border-blue-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {medal ? (
                                    <div className="text-3xl">{medal}</div>
                                  ) : (
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                      leaderboardData.rank === 1 
                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                        : leaderboardData.rank === 2
                                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                                        : leaderboardData.rank === 3
                                        ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                                        : 'bg-gradient-to-br from-blue-400 to-purple-500'
                                    }`}>
                                      #{leaderboardData.rank}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <TrophyIcon className={`w-4 h-4 ${
                                        leaderboardData.rank === 1 ? 'text-yellow-600' :
                                        leaderboardData.rank === 2 ? 'text-gray-600' :
                                        leaderboardData.rank === 3 ? 'text-orange-600' :
                                        'text-blue-600'
                                      }`} />
                                      <span className={`font-bold text-sm ${
                                        leaderboardData.rank === 1 ? 'text-yellow-700' :
                                        leaderboardData.rank === 2 ? 'text-gray-700' :
                                        leaderboardData.rank === 3 ? 'text-orange-700' :
                                        'text-blue-700'
                                      }`}>
                                        Rank #{leaderboardData.rank} of {leaderboardData.totalParticipants}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-lg">💎</span>
                                      <span className="text-xs text-gray-600 font-medium">
                                        {leaderboardData.hiraPoints} Hira points
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">Your Position</div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-gray-100">
                            <span>{challenge.participants.length} participants</span>
                            <span>•</span>
                            <span>{challenge.photos.length} photos</span>
                            <span className="ml-auto text-blue-600 font-medium text-xs flex items-center gap-1">
                              View Leaderboard
                              <ArrowRightIcon className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Share Modal */}
        {selectedPhoto && (
          <SocialShareTemplate
            habit={selectedPhoto.habit}
            photo={selectedPhoto.photo}
            onClose={() => setSelectedPhoto(null)}
          />
        )}

        {/* Camera for Profile Photo */}
        {showCameraForDP && (
          <CameraCapture
            habitName="Profile Photo"
            onCapture={handleProfilePhotoCapture}
            onClose={() => setShowCameraForDP(false)}
          />
        )}
      </div>
    </Layout>
  );
}
