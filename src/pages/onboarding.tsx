import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CameraIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { getUser, saveUser, addHabit } from '@/utils/storage';
import { Habit } from '@/types';
import CameraCapture from '@/components/CameraCapture';
import EmojiPicker from '@/components/EmojiPicker';
import { playBackgroundMusic, stopBackgroundMusic } from '@/utils/backgroundMusic';

export default function Onboarding() {
  const router = useRouter();

  useEffect(() => {
    // Ensure background music continues playing
    playBackgroundMusic();
    
    // Stop music when component unmounts (user completes onboarding)
    return () => {
      // Don't stop here, let it continue until user navigates away from onboarding
    };
  }, []);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('⭐');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [totalDays, setTotalDays] = useState(30);

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep(2);
    }
  };

  const handlePhotoCapture = (photoData: string) => {
    setProfilePhoto(photoData);
    setShowCamera(false);
    sounds.success();
  };

  const handlePhotoSkip = () => {
    setStep(3);
  };

  const handlePhotoNext = () => {
    if (profilePhoto) {
      setStep(3);
    }
  };

  const handleHabitSubmit = () => {
    if (!habitName.trim()) return;

    const user = getUser();
    if (!user) return;

    // Update user with name and photo
    const updatedUser = {
      ...user,
      name: name.trim(),
      profilePhoto: profilePhoto || undefined,
      hasCompletedOnboarding: true,
    };
    saveUser(updatedUser);

    // Create first habit
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

    // Stop background music when onboarding is complete
    stopBackgroundMusic();
    
    // Redirect to home
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

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

        {/* Step 2: Profile Photo */}
        {step === 2 && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-purple-100 mb-4">
                <CameraIcon className="w-8 h-8 text-purple-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Add a profile photo</h2>
              <p className="text-gray-600">This helps personalize your profile</p>
            </div>

            <div className="space-y-6">
              {profilePhoto ? (
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 full overflow-hidden border-4 border-blue-500 mb-4">
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => {
                      setShowCamera(true);
                    }}
                    className="text-blue-500 font-medium hover:text-blue-600"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 full bg-gray-100 flex items-center justify-center mb-4">
                    <CameraIcon className="w-12 h-12 text-gray-400" />
                  </div>
                  <button
                    onClick={() => {
                      setShowCamera(true);
                    }}
                    className="px-6 py-3 bg-blue-500 text-white xl font-medium hover:bg-blue-600 transition-all"
                  >
                    Take Photo
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handlePhotoSkip();
                  }}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Skip
                </button>
                {profilePhoto && (
                  <button
                    onClick={() => {
                      handlePhotoNext();
                    }}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Continue
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {showCamera && (
              <CameraCapture
                habitName="Profile"
                onCapture={handlePhotoCapture}
                onClose={() => setShowCamera(false)}
              />
            )}
          </div>
        )}

        {/* Step 3: First Habit */}
        {step === 3 && (
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

              <button
                onClick={handleHabitSubmit}
                disabled={!habitName.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Complete Setup
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

