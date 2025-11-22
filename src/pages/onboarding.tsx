import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowRightIcon, MusicalNoteIcon, SpeakerXMarkIcon, XMarkIcon, ShareIcon } from '@heroicons/react/24/solid';
import { getUser, saveUser, addHabit } from '@/utils/storage';
import { Habit } from '@/types';
import EmojiPicker from '@/components/EmojiPicker';
import { playBackgroundMusic, stopBackgroundMusic, pauseBackgroundMusic, resumeBackgroundMusic } from '@/utils/backgroundMusic';
import { sounds } from '@/utils/sounds';

export default function Onboarding() {
  const router = useRouter();
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  useEffect(() => {
    // Check localStorage for music preference
    const musicPreference = localStorage.getItem('musicEnabled');
    const shouldPlayMusic = musicPreference === null || musicPreference === 'true';
    
    if (shouldPlayMusic) {
      playBackgroundMusic();
      setIsMusicPlaying(true);
    } else {
      setIsMusicPlaying(false);
    }
    
    // Stop music when component unmounts (user completes onboarding)
    return () => {
      // Don't stop here, let it continue until user navigates away from onboarding
    };
  }, []);

  const toggleMusic = async () => {
    if (isMusicPlaying) {
      pauseBackgroundMusic();
      setIsMusicPlaying(false);
      localStorage.setItem('musicEnabled', 'false');
    } else {
      await resumeBackgroundMusic();
      setIsMusicPlaying(true);
      localStorage.setItem('musicEnabled', 'true');
    }
  };

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('⭐');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [totalDays, setTotalDays] = useState(30);
  const [showAppIntroModal, setShowAppIntroModal] = useState(false);
  const [introScreen, setIntroScreen] = useState(1);

  // Predefined habits
  const predefinedHabits = [
    { name: 'Morning Workout', emoji: '💪', reminderTime: '07:00' },
    { name: 'Read 20 Pages', emoji: '📚', reminderTime: '09:00' },
    { name: 'Meditate', emoji: '🧘', reminderTime: '06:00' },
  ];

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep(2);
    }
  };

  const handlePredefinedHabitSelect = (habit: { name: string; emoji: string; reminderTime: string }) => {
    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: habit.name,
      emoji: habit.emoji,
      createdAt: new Date().toISOString(),
      completedDates: [],
      photos: [],
      totalHira: 0,
      reminderTime: habit.reminderTime,
      totalDays: 30,
      startDate: new Date().toISOString(),
    };

    addHabit(newHabit);
    sounds.success();
    
    // Update user
    const user = getUser();
    if (user) {
      const updatedUser = {
        ...user,
        name: name.trim(),
        hasCompletedOnboarding: true,
      };
      saveUser(updatedUser);
    }

    // Show app intro modal
    setShowAppIntroModal(true);
  };

  const handleCustomHabitSubmit = () => {
    if (!habitName.trim()) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: habitName.trim(),
      emoji: habitEmoji,
      createdAt: new Date().toISOString(),
      completedDates: [],
      photos: [],
      totalHira: 0,
      reminderTime,
      totalDays,
      startDate: new Date().toISOString(),
    };

    addHabit(newHabit);
    sounds.success();
    
    // Update user
    const user = getUser();
    if (user) {
      const updatedUser = {
        ...user,
        name: name.trim(),
        hasCompletedOnboarding: true,
      };
      saveUser(updatedUser);
    }

    // Close custom form and show app intro modal
    setShowCustomHabitForm(false);
    setShowAppIntroModal(true);
  };

  const handleIntroNext = () => {
    if (introScreen < 3) {
      setIntroScreen(introScreen + 1);
    } else {
      // Complete onboarding
      stopBackgroundMusic();
      router.push('/');
    }
  };

  const handleIntroSkip = () => {
    stopBackgroundMusic();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12 relative">
      {/* Music Toggle Button */}
      <button
        onClick={toggleMusic}
        className="fixed top-4 right-4 z-50 p-3 bg-white/90 hover:bg-white border border-gray-200 text-gray-800 rounded-full transition-all shadow-lg"
        aria-label={isMusicPlaying ? 'Turn off music' : 'Turn on music'}
      >
        {isMusicPlaying ? (
          <MusicalNoteIcon className="w-6 h-6" />
        ) : (
          <SpeakerXMarkIcon className="w-6 h-6" />
        )}
      </button>

      <div className="max-w-md w-full">
        {/* Progress Indicator */}
        {!showAppIntroModal && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Step {step} of 2</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((step / 2) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-blue-100 mb-4">
                <span className="text-4xl">💎</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your name?</h2>
              <p className="text-gray-600">Let's personalize your experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
                  placeholder="Enter your name"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-lg"
                  autoFocus
                />
              </div>

              <button
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Habit Selection */}
        {step === 2 && !showCustomHabitForm && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-green-100 mb-4">
                <span className="text-4xl">💎</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your first habit</h2>
              <p className="text-gray-600">Start your journey to building rich habits</p>
            </div>

            <div className="space-y-3">
              {predefinedHabits.map((habit, index) => (
                <button
                  key={index}
                  onClick={() => handlePredefinedHabitSelect(habit)}
                  className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{habit.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                      <p className="text-sm text-gray-500">Reminder at {habit.reminderTime}</p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}

              <button
                onClick={() => setShowCustomHabitForm(true)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">➕</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Other</h3>
                    <p className="text-sm text-gray-500">Create your own habit</p>
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Custom Habit Form */}
        {step === 2 && showCustomHabitForm && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-green-100 mb-4">
                <span className="text-4xl">💎</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your first habit</h2>
              <p className="text-gray-600">Start your journey to building rich habits</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Emoji</label>
                <div className="flex items-center gap-3">
                  <EmojiPicker selectedEmoji={habitEmoji} onSelect={setHabitEmoji} />
                  <p className="text-sm text-gray-500">Choose an emoji for your habit</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => {
                    setHabitName(e.target.value);
                  }}
                  placeholder="e.g., Morning Workout"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => {
                    setReminderTime(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                <input
                  type="number"
                  value={totalDays}
                  onChange={(e) => {
                    setTotalDays(parseInt(e.target.value) || 30);
                  }}
                  min="1"
                  max="365"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">How many days do you want to commit to this habit?</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCustomHabitForm(false);
                    setHabitName('');
                    setHabitEmoji('⭐');
                    setReminderTime('09:00');
                    setTotalDays(30);
                  }}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCustomHabitSubmit}
                  disabled={!habitName.trim()}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Create
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* App Introduction Modal */}
        {showAppIntroModal && (
          <div 
            className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4"
          >
            <div 
              className="w-full max-w-2xl h-full overflow-y-auto relative flex flex-col bg-white"
            >
              {/* Close Button */}
              <button
                onClick={handleIntroSkip}
                className="absolute top-4 right-4 z-10 p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Skip introduction"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>

              {/* Screen 1: Building Habits */}
              {introScreen === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-8 max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-100 mb-4">
                    <span className="text-6xl">💎</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Build Your Habits</h2>
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl">
                    Track your daily habits. Complete your habits every day to earn Hira diamonds and build consistency.
                  </p>
                  <div className="py-6 w-full max-w-md">
                    <div className="bg-gray-50 rounded-xl p-8 space-y-4">
                      <div className="flex items-center gap-4 text-left">
                        <span className="text-3xl">✅</span>
                        <p className="text-lg text-gray-700">Complete habits</p>
                      </div>
                      <div className="flex items-center gap-4 text-left">
                        <span className="text-3xl">💎</span>
                        <p className="text-lg text-gray-700">Earn Hira for every completion</p>
                      </div>
                      <div className="flex items-center gap-4 text-left">
                        <span className="text-3xl">📊</span>
                        <p className="text-lg text-gray-700">Track your progress over time</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  </div>
                  <button
                    onClick={handleIntroNext}
                    className="w-full max-w-md py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Next
                    <ArrowRightIcon className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Screen 2: Social Sharing */}
              {introScreen === 2 && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-8 max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-purple-100 mb-4">
                    <ShareIcon className="w-16 h-16 text-purple-500" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Share Your Journey</h2>
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl">
                    Celebrate your achievements by sharing your progress. Create beautiful shareable images and inspire others on their journey.
                  </p>
                  <div className="py-6 w-full max-w-md">
                    <div className="bg-gray-50 rounded-xl p-8 space-y-4">
                      <div className="flex items-center gap-4 text-left">
                        <span className="text-3xl">🎨</span>
                        <p className="text-lg text-gray-700">Beautiful shareable images</p>
                      </div>
                      <div className="flex items-center gap-4 text-left">
                        <ShareIcon className="w-8 h-8 text-purple-500" />
                        <p className="text-lg text-gray-700">Share to social media</p>
                      </div>
                      <div className="flex items-center gap-4 text-left">
                        <span className="text-3xl">🌟</span>
                        <p className="text-lg text-gray-700">Inspire your community</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  </div>
                  <button
                    onClick={handleIntroNext}
                    className="w-full max-w-md py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Next
                    <ArrowRightIcon className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Screen 3: Final Screen */}
              {introScreen === 3 && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-8 max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                    <span className="text-6xl">🎉</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">You're All Set!</h2>
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl">
                    Start building your habits, earn Hira, and share your progress with the world. Your journey to consistency starts now!
                  </p>
                  <div className="py-6 w-full max-w-md">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
                      <p className="text-xl text-gray-700 font-medium">
                        Ready to build amazing habits? Let's go! 🚀
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                  <button
                    onClick={handleIntroNext}
                    className="w-full max-w-md py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Get Started
                    <ArrowRightIcon className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

