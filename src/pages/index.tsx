import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import HabitCard from '@/components/HabitCard';
import CompletionShareModal from '@/components/CompletionShareModal';
import EmojiPicker from '@/components/EmojiPicker';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Habit, HabitPhoto } from '@/types';
import {
  getHabits,
  addHabit,
  updateHabit,
  addPhoto,
  getPhotos,
  getUser,
  saveUser,
} from '@/utils/storage';
import { sounds } from '@/utils/sounds';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('⭐');
  const [newHabitCategory, setNewHabitCategory] = useState('Daily');
  const [newHabitPriority, setNewHabitPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [timesPerDay, setTimesPerDay] = useState<number>(1);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [totalDays, setTotalDays] = useState(30);

  const HABIT_CATEGORIES = ['Fitness', 'Health', 'Learning', 'Work', 'Social', 'Creative', 'Daily', 'Mindfulness', 'Finance', 'Productivity'];
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedHabit, setCompletedHabit] = useState<Habit | null>(null);
  const [showRedeemInfoModal, setShowRedeemInfoModal] = useState(false);
  const [showRedeemBanner, setShowRedeemBanner] = useState(() => {
    if (typeof window === 'undefined') return true;
    const dismissed = localStorage.getItem('redeem_banner_dismissed');
    return dismissed !== 'true';
  });
  const user = getUser();

  useEffect(() => {
    setHabits(getHabits());
  }, []);

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: newHabitName,
      emoji: newHabitEmoji,
      category: newHabitCategory,
      priority: newHabitPriority,
      timesPerDay: timesPerDay,
      createdAt: new Date().toISOString(),
      completedDates: [],
      photos: [],
      totalHira: 0,
      reminderTime,
      totalDays,
      startDate: new Date().toISOString(),
    };

    addHabit(newHabit);
    setHabits(getHabits());
    setNewHabitName('');
    setNewHabitEmoji('⭐');
    setNewHabitCategory('Daily');
    setNewHabitPriority('Medium');
    setTimesPerDay(1);
    setReminderTime('09:00');
    setTotalDays(30);
    setShowAddHabit(false);
    sounds.success();
  };

  const handleCompleteHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const timesPerDay = habit.timesPerDay || 1;
    const todayCompletions = habit.completedDates.filter(date => date === today).length;
    
    // Check if already completed all times for today
    if (todayCompletions >= timesPerDay) return;

    // Add another completion for today
    const updatedCompletedDates = [...habit.completedDates, today];
    const hiraEarned = 1; // 1 hira per completion
    const newTotalHira = habit.totalHira + hiraEarned;
    const newTodayCompletions = todayCompletions + 1;

    const updatedHabit = {
      ...habit,
      completedDates: updatedCompletedDates,
      totalHira: newTotalHira,
    };

    updateHabit(habitId, {
      completedDates: updatedCompletedDates,
      totalHira: newTotalHira,
    });

    // Update user stats
    if (user) {
      const updatedUser = {
        ...user,
        totalHira: user.totalHira + hiraEarned,
      };
      saveUser(updatedUser);
    }

    setHabits(getHabits());
    
    // Show completion modal only when fully completed (reached timesPerDay)
    if (newTodayCompletions >= timesPerDay) {
      setCompletedHabit(updatedHabit);
      setShowCompletionModal(true);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTodayDate = () => {
    const today = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[today.getDay()]}, ${months[today.getMonth()]} ${today.getDate()}`;
  };

  const today = new Date().toISOString().split('T')[0];
  // Count habits that are fully completed today (reached their timesPerDay goal)
  const completedToday = habits.filter(h => {
    const timesPerDay = h.timesPerDay || 1;
    const todayCompletions = h.completedDates.filter(date => date === today).length;
    return todayCompletions >= timesPerDay;
  }).length;
  const totalHabits = habits.length;
  const progressPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Sort and separate habits by priority and completion status
  const getPriorityValue = (priority?: string): number => {
    switch (priority) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0; // No priority set
    }
  };

  const sortedHabits = [...habits].sort((a, b) => {
    const aTimesPerDay = a.timesPerDay || 1;
    const bTimesPerDay = b.timesPerDay || 1;
    const aTodayCompletions = a.completedDates.filter(date => date === today).length;
    const bTodayCompletions = b.completedDates.filter(date => date === today).length;
    const aCompleted = aTodayCompletions >= aTimesPerDay;
    const bCompleted = bTodayCompletions >= bTimesPerDay;
    
    // First, separate completed from incomplete
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1; // Incomplete first
    }
    
    // If both have same completion status, sort by priority
    const aPriority = getPriorityValue(a.priority);
    const bPriority = getPriorityValue(b.priority);
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }
    
    // If same priority, maintain original order
    return 0;
  });

  const incompleteHabits = sortedHabits.filter(h => {
    const timesPerDay = h.timesPerDay || 1;
    const todayCompletions = h.completedDates.filter(date => date === today).length;
    return todayCompletions < timesPerDay;
  });
  const completedHabits = sortedHabits.filter(h => {
    const timesPerDay = h.timesPerDay || 1;
    const todayCompletions = h.completedDates.filter(date => date === today).length;
    return todayCompletions >= timesPerDay;
  });

  return (
    <Layout>
      <div className="min-h-screen bg-white pb-24">
        {/* Header with Greeting */}
        <div className="bg-white border-b border-[#e5e5e5]">
          <div className="max-w-2xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                {user?.profilePhoto ? (
                  <div className="w-12 h-12 overflow-hidden border-2 border-orange-200 shadow-sm">
                    <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 shadow-sm"></div>
                )}
                <div>
                  <h2 className="text-2xl text-black mb-1">
                    <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>{getGreeting()}</span>, {user?.name || 'User'}
                  </h2>
                  <p className="text-sm text-[#666666]">{getTodayDate()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#fafafa] px-4 py-2 border border-[#e5e5e5]">
                <span className="text-xl">💎</span>
                <div className="flex flex-col items-start">
                  <div className="flex items-baseline gap-1">
                    <span className="font-medium text-base text-black">{user?.totalHira || 0}</span>
                    <span className="text-xs text-[#666666]">Hira</span>
                  </div>
                  {user && user.totalHira > 0 && (
                    <span className="text-xs text-green-600 font-medium">₹{((user.totalHira || 0) * 1.5).toFixed(0)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Redeem Hira Message */}
            {showRedeemBanner && (
              <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 border border-green-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">💰</span>
                    <p className="text-sm font-medium text-gray-900">
                      Redeem Hira and get cash! (1 Hira = ₹1.5)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRedeemInfoModal(true)}
                    className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors"
                  >
                    Know more
                  </button>
                </div>
              </div>
            )}

            {/* Progress Card - Minimal */}
            {habits.length > 0 && (
              <div className="mt-6 bg-[#fafafa] border border-[#e5e5e5] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#666666] mb-2">Today's Progress</p>
                    <p className="text-2xl text-black">
                      {completedToday}/{totalHabits} habits completed
                    </p>
                  </div>
                  <div className="relative w-16 h-16">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#e5e5e5"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="#0066ff"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressPercentage / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-black">{progressPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Habits Feed */}
        <div className="max-w-2xl mx-auto px-4 py-6">
          {habits.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20  bg-[#fafafa] border border-[#e5e5e5] mb-6">
                <span className="text-4xl">💎</span>
              </div>
              <h2 className="text-3xl text-black mb-4">
                Welcome to Hira
              </h2>
              <p className="text-[#666666] mb-8 max-w-sm mx-auto leading-relaxed">
                A simple, joyful way to take control of your time and routines. Start building rich habits today!
              </p>
              <button
                onClick={() => {
                  setShowAddHabit(true);
                }}
                className="px-8 py-3.5 bg-black text-white font-medium hover:bg-[#1a1a1a] transition-all border border-black"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div>
              {incompleteHabits.length > 0 && (
                <>
                  <h3 className="text-lg text-black mb-6">Today</h3>
                  <div className="space-y-3 mb-8">
                    {incompleteHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onComplete={handleCompleteHabit}
                      />
                    ))}
                  </div>
                </>
              )}

              {completedHabits.length > 0 && (
                <>
                  <h3 className="text-lg text-black mb-6">Completed Tasks</h3>
                  <div className="space-y-3">
                    {completedHabits.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onComplete={handleCompleteHabit}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Add Habit FAB */}
        {habits.length > 0 && (
          <button
            onClick={() => {
              setShowAddHabit(true);
            }}
            className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white  flex items-center justify-center hover:bg-[#1a1a1a] transition-all z-10 border border-black"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        )}

        {/* Add Habit Modal */}
        {showAddHabit && (
          <div 
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => {
              setShowAddHabit(false);
              setNewHabitName('');
              setNewHabitEmoji('⭐');
              setNewHabitCategory('Daily');
              setNewHabitPriority('Medium');
              setTimesPerDay(1);
              setReminderTime('09:00');
              setTotalDays(30);
            }}
          >
            <div 
              className="bg-white  p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border-t border-[#e5e5e5]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl text-black mb-6">New Habit</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-2">Habit Name</label>
                  <input
                    type="text"
                    value={newHabitName}
                    onChange={(e) => {
                      setNewHabitName(e.target.value);
                    }}
                    placeholder="e.g., Morning Workout"
                    className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] text-black placeholder-[#999999] focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-2">Select Emoji</label>
                  <div className="flex items-center gap-3">
                    <EmojiPicker selectedEmoji={newHabitEmoji} onSelect={setNewHabitEmoji} />
                    <p className="text-sm text-[#666666]">Choose an emoji for your habit</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-2">Category</label>
                  <select
                    value={newHabitCategory}
                    onChange={(e) => setNewHabitCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] text-black focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
                  >
                    {HABIT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-2">Priority</label>
                  <select
                    value={newHabitPriority}
                    onChange={(e) => setNewHabitPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] text-black focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-2">Times Per Day</label>
                  <input
                    type="number"
                    value={timesPerDay}
                    onChange={(e) => setTimesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] text-black focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
                  />
                  <p className="text-xs text-[#666666] mt-1">How many times do you want to complete this habit per day?</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-2">Daily Reminder Time</label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => {
                      setReminderTime(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] text-black focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#666666] mb-2">Total Days</label>
                  <input
                    type="number"
                    value={totalDays}
                    onChange={(e) => {
                      setTotalDays(parseInt(e.target.value) || 30);
                    }}
                    min="1"
                    max="365"
                    className="w-full px-4 py-3 bg-[#fafafa] border border-[#e5e5e5] text-black focus:outline-none focus:border-[#0066ff] focus:bg-white transition-all"
                  />
                  <p className="text-xs text-[#666666] mt-1">How many days do you want to commit to this habit?</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowAddHabit(false);
                      setNewHabitName('');
                      setNewHabitEmoji('⭐');
                      setNewHabitCategory('Daily');
                      setNewHabitPriority('Medium');
                      setTimesPerDay(1);
                      setReminderTime('09:00');
                      setTotalDays(30);
                    }}
                    className="flex-1 py-3 bg-white text-black border border-[#e5e5e5] hover:bg-[#fafafa] transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddHabit}
                    className="flex-1 py-3 bg-black text-white hover:bg-[#1a1a1a] transition-all font-medium border border-black"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completion Share Modal */}
        {showCompletionModal && completedHabit && (
          <CompletionShareModal
            habit={completedHabit}
            onClose={() => {
              setShowCompletionModal(false);
              setCompletedHabit(null);
            }}
          />
        )}

        {/* Redeem Info Modal */}
        {showRedeemInfoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full p-6 relative">
              <button
                onClick={() => {
                  setShowRedeemInfoModal(false);
                  // Hide the banner after closing the modal
                  setShowRedeemBanner(false);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('redeem_banner_dismissed', 'true');
                  }
                }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">💰</span>
                  <h2 className="text-2xl font-bold text-gray-900">Redeem Hira for Cash</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 border border-green-200">
                    <p className="text-sm text-gray-700 mb-2">
                      <span className="font-semibold">Conversion Rate:</span> 1 Hira = ₹1.5
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">How to Redeem:</h3>
                    <ol className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">1</span>
                        <span>Complete habits to earn Hira points</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">2</span>
                        <span>Go to the <span className="font-semibold">Rewards</span> page from the bottom navigation</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">3</span>
                        <span>Find the <span className="font-semibold">Cash Redeems</span> section</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">4</span>
                        <span>Select the cash amount you want to redeem (₹10, ₹25, ₹50, or ₹100)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">5</span>
                        <span>Click <span className="font-semibold">"Buy with X 💎"</span> to redeem</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-bold text-xs">!</span>
                        <span className="text-yellow-700 font-medium">Note: Cash redemption is only allowed after completing an entire habit goal</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-red-50 p-4 border border-red-200">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-bold text-xs">⚠</span>
                      <div>
                        <p className="text-sm text-red-700 font-semibold mb-1">Important:</p>
                        <p className="text-sm text-red-700">
                          If a task is missed in a day, you will lose <span className="font-bold">-5 Hira per task</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowRedeemInfoModal(false);
                  // Hide the banner after closing the modal
                  setShowRedeemBanner(false);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('redeem_banner_dismissed', 'true');
                  }
                }}
                className="w-full py-3 bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
