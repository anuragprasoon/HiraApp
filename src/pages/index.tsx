import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import HabitCard from '@/components/HabitCard';
import HabitDetailModal from '@/components/HabitDetailModal';
import CompletionShareModal from '@/components/CompletionShareModal';
import EmojiPicker from '@/components/EmojiPicker';
import { PlusIcon } from '@heroicons/react/24/outline';
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
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitEmoji, setNewHabitEmoji] = useState('⭐');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [totalDays, setTotalDays] = useState(30);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedHabit, setCompletedHabit] = useState<Habit | null>(null);
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
    setReminderTime('09:00');
    setTotalDays(30);
    setShowAddHabit(false);
    sounds.success();
  };

  const handleCompleteHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const today = new Date().toISOString().split('T')[0];
    const isAlreadyCompleted = habit.completedDates.includes(today);
    
    if (isAlreadyCompleted) return;

    // Update habit
    const updatedCompletedDates = [...habit.completedDates, today];
    const hiraEarned = 1; // 1 hira per completion
    const newTotalHira = habit.totalHira + hiraEarned;

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
    
    // Show completion modal
    setCompletedHabit(updatedHabit);
    setShowCompletionModal(true);
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
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const progressPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

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
                <span className="font-medium text-base text-black">{user?.totalHira || 0}</span>
                <span className="text-xs text-[#666666]">Hira</span>
              </div>
            </div>

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
              <h3 className="text-lg text-black mb-6">Today</h3>
                <div className="space-y-3">
                  {habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      onComplete={handleCompleteHabit}
                      onViewDetails={setSelectedHabit}
                    />
                  ))}
                </div>
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
                  <label className="block text-sm font-medium text-[#666666] mb-2">Select Emoji</label>
                  <div className="flex items-center gap-3">
                    <EmojiPicker selectedEmoji={newHabitEmoji} onSelect={setNewHabitEmoji} />
                    <p className="text-sm text-[#666666]">Choose an emoji for your habit</p>
                  </div>
                </div>

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

        {/* Habit Detail Modal */}
        {selectedHabit && (
          <HabitDetailModal
            habit={selectedHabit}
            photos={getPhotos()}
            onClose={() => setSelectedHabit(null)}
          />
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
      </div>
    </Layout>
  );
}
