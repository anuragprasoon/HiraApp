import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowRightIcon, MusicalNoteIcon, SpeakerXMarkIcon, XMarkIcon, ShareIcon } from '@heroicons/react/24/solid';
import { getUser, saveUser, addHabit } from '@/utils/storage';
import { Habit } from '@/types';
import EmojiPicker from '@/components/EmojiPicker';
import { playBackgroundMusic, stopBackgroundMusic, pauseBackgroundMusic, resumeBackgroundMusic } from '@/utils/backgroundMusic';
import { sounds } from '@/utils/sounds';

const HABIT_CATEGORIES = ['Fitness', 'Health', 'Learning', 'Work', 'Social', 'Creative', 'Daily', 'Mindfulness', 'Finance', 'Productivity'];

// Habit suggestion function based on user profile
const suggestHabits = (userProfile: {
  age?: number;
  gender?: string;
  collegeOrProfession?: string;
  hobbies?: string[];
}): Array<{ name: string; emoji: string; reminderTime: string; category: string; reason?: string }> => {
  const suggestions: Array<{ name: string; emoji: string; reminderTime: string; category: string; reason?: string }> = [];
  const addedHabits = new Set<string>();

  // Age-based suggestions
  if (userProfile.age) {
    if (userProfile.age < 18) {
      if (!addedHabits.has('Study')) {
        suggestions.push({ name: 'Study for 1 Hour', emoji: '📚', reminderTime: '18:00', category: 'Learning', reason: 'Perfect for students' });
        addedHabits.add('Study');
      }
    } else if (userProfile.age >= 18 && userProfile.age < 25) {
      if (!addedHabits.has('Exercise')) {
        suggestions.push({ name: 'Morning Workout', emoji: '💪', reminderTime: '07:00', category: 'Fitness', reason: 'Great for young adults' });
        addedHabits.add('Exercise');
      }
    } else if (userProfile.age >= 25) {
      if (!addedHabits.has('Meditation')) {
        suggestions.push({ name: 'Meditate', emoji: '🧘', reminderTime: '06:00', category: 'Mindfulness', reason: 'Helps with stress management' });
        addedHabits.add('Meditation');
      }
    }
  }

  // Profession/College-based suggestions
  if (userProfile.collegeOrProfession) {
    const prof = userProfile.collegeOrProfession.toLowerCase();
    if (prof.includes('student') || prof.includes('college') || prof.includes('university')) {
      if (!addedHabits.has('Read')) {
        suggestions.push({ name: 'Read 20 Pages', emoji: '📖', reminderTime: '20:00', category: 'Learning', reason: 'Perfect for students' });
        addedHabits.add('Read');
      }
      if (!addedHabits.has('Study')) {
        suggestions.push({ name: 'Study Session', emoji: '✏️', reminderTime: '19:00', category: 'Learning', reason: 'Build study consistency' });
        addedHabits.add('Study');
      }
    } else if (prof.includes('engineer') || prof.includes('developer') || prof.includes('programmer') || prof.includes('tech')) {
      if (!addedHabits.has('Code')) {
        suggestions.push({ name: 'Code Practice', emoji: '💻', reminderTime: '09:00', category: 'Work', reason: 'Level up your skills' });
        addedHabits.add('Code');
      }
      if (!addedHabits.has('Exercise')) {
        suggestions.push({ name: 'Stretch Break', emoji: '🤸', reminderTime: '15:00', category: 'Health', reason: 'Important for desk workers' });
        addedHabits.add('Exercise');
      }
    } else if (prof.includes('design') || prof.includes('creative')) {
      if (!addedHabits.has('Design')) {
        suggestions.push({ name: 'Design Practice', emoji: '🎨', reminderTime: '10:00', category: 'Creative', reason: 'Hone your creative skills' });
        addedHabits.add('Design');
      }
    } else if (prof.includes('doctor') || prof.includes('medical') || prof.includes('health')) {
      if (!addedHabits.has('Exercise')) {
        suggestions.push({ name: 'Morning Walk', emoji: '🚶', reminderTime: '06:30', category: 'Health', reason: 'Stay active' });
        addedHabits.add('Exercise');
      }
      if (!addedHabits.has('Water')) {
        suggestions.push({ name: 'Drink Water', emoji: '💧', reminderTime: '08:00', category: 'Health', reason: 'Stay hydrated' });
        addedHabits.add('Water');
      }
    } else if (prof.includes('teacher') || prof.includes('educator')) {
      if (!addedHabits.has('Read')) {
        suggestions.push({ name: 'Read Educational Content', emoji: '📚', reminderTime: '19:00', category: 'Learning', reason: 'Keep learning' });
        addedHabits.add('Read');
      }
    }
  }

  // Hobby-based suggestions
  if (userProfile.hobbies && userProfile.hobbies.length > 0) {
    userProfile.hobbies.forEach(hobby => {
      const hobbyLower = hobby.toLowerCase();
      if ((hobbyLower.includes('fitness') || hobbyLower.includes('gym') || hobbyLower.includes('workout')) && !addedHabits.has('Exercise')) {
        suggestions.push({ name: 'Gym Session', emoji: '🏋️', reminderTime: '07:00', category: 'Fitness', reason: 'Matches your fitness interest' });
        addedHabits.add('Exercise');
      } else if ((hobbyLower.includes('read') || hobbyLower.includes('book')) && !addedHabits.has('Read')) {
        suggestions.push({ name: 'Read Books', emoji: '📚', reminderTime: '21:00', category: 'Learning', reason: 'Perfect for book lovers' });
        addedHabits.add('Read');
      } else if ((hobbyLower.includes('music') || hobbyLower.includes('sing') || hobbyLower.includes('play')) && !addedHabits.has('Music')) {
        suggestions.push({ name: 'Practice Music', emoji: '🎵', reminderTime: '18:00', category: 'Creative', reason: 'Pursue your passion' });
        addedHabits.add('Music');
      } else if ((hobbyLower.includes('art') || hobbyLower.includes('draw') || hobbyLower.includes('paint')) && !addedHabits.has('Art')) {
        suggestions.push({ name: 'Art Practice', emoji: '🎨', reminderTime: '16:00', category: 'Creative', reason: 'Express your creativity' });
        addedHabits.add('Art');
      } else if ((hobbyLower.includes('code') || hobbyLower.includes('program')) && !addedHabits.has('Code')) {
        suggestions.push({ name: 'Coding Practice', emoji: '💻', reminderTime: '20:00', category: 'Work', reason: 'Build your skills' });
        addedHabits.add('Code');
      } else if ((hobbyLower.includes('write') || hobbyLower.includes('journal')) && !addedHabits.has('Journal')) {
        suggestions.push({ name: 'Journal Writing', emoji: '✍️', reminderTime: '22:00', category: 'Mindfulness', reason: 'Reflect on your day' });
        addedHabits.add('Journal');
      } else if ((hobbyLower.includes('meditat') || hobbyLower.includes('yoga')) && !addedHabits.has('Meditation')) {
        suggestions.push({ name: 'Yoga/Meditation', emoji: '🧘', reminderTime: '06:00', category: 'Mindfulness', reason: 'Find inner peace' });
        addedHabits.add('Meditation');
      }
    });
  }

  // Default suggestions if not enough
  if (suggestions.length < 3) {
    if (!addedHabits.has('Exercise')) {
      suggestions.push({ name: 'Morning Workout', emoji: '💪', reminderTime: '07:00', category: 'Fitness', reason: 'Start your day right' });
      addedHabits.add('Exercise');
    }
    if (!addedHabits.has('Read') && suggestions.length < 3) {
      suggestions.push({ name: 'Read 20 Pages', emoji: '📚', reminderTime: '09:00', category: 'Learning', reason: 'Expand your mind' });
      addedHabits.add('Read');
    }
    if (!addedHabits.has('Water') && suggestions.length < 3) {
      suggestions.push({ name: 'Drink Water', emoji: '💧', reminderTime: '08:00', category: 'Health', reason: 'Stay healthy' });
      addedHabits.add('Water');
    }
  }

  return suggestions.slice(0, 3); // Return top 3 suggestions
};

export default function Onboarding() {
  const router = useRouter();
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);

  useEffect(() => {
    const musicPreference = localStorage.getItem('musicEnabled');
    const shouldPlayMusic = musicPreference === null || musicPreference === 'true';
    
    if (shouldPlayMusic) {
      playBackgroundMusic();
      setIsMusicPlaying(true);
    } else {
      setIsMusicPlaying(false);
    }
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
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [collegeOrProfession, setCollegeOrProfession] = useState('');
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [currentHobby, setCurrentHobby] = useState('');
  const [showCustomHabitForm, setShowCustomHabitForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitEmoji, setHabitEmoji] = useState('⭐');
  const [habitCategory, setHabitCategory] = useState('Daily');
  const [habitPriority, setHabitPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [timesPerDay, setTimesPerDay] = useState<number>(1);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [totalDays, setTotalDays] = useState(30);
  const [showAppIntroModal, setShowAppIntroModal] = useState(false);
  const [introScreen, setIntroScreen] = useState(1);
  const [suggestedHabits, setSuggestedHabits] = useState<Array<{ name: string; emoji: string; reminderTime: string; category: string; reason?: string }>>([]);

  const commonHobbies = ['Fitness/Gym', 'Reading', 'Music', 'Art/Drawing', 'Coding', 'Writing/Journaling', 'Yoga/Meditation', 'Photography', 'Cooking', 'Gaming', 'Sports', 'Travel'];

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep(2);
    }
  };

  const handleAgeSubmit = () => {
    if (age && age > 0 && age < 150) {
      setStep(3);
    }
  };

  const handleGenderSubmit = () => {
    if (gender) {
      setStep(4);
    }
  };

  const handleCollegeOrProfessionSubmit = () => {
    if (collegeOrProfession.trim()) {
      setStep(5);
    }
  };

  const handleHobbyAdd = () => {
    if (currentHobby.trim() && !hobbies.includes(currentHobby.trim())) {
      setHobbies([...hobbies, currentHobby.trim()]);
      setCurrentHobby('');
    }
  };

  const handleHobbyRemove = (hobby: string) => {
    setHobbies(hobbies.filter(h => h !== hobby));
  };

  const handleHobbiesSubmit = () => {
    // Generate habit suggestions based on profile
    const profile = {
      age: typeof age === 'number' ? age : undefined,
      gender,
      collegeOrProfession,
      hobbies,
    };
    const suggestions = suggestHabits(profile);
    setSuggestedHabits(suggestions);
    setStep(6);
  };

  const handlePredefinedHabitSelect = (habit: { name: string; emoji: string; reminderTime: string; category: string }) => {
    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: habit.name,
      emoji: habit.emoji,
      category: habit.category,
      priority: habitPriority,
      timesPerDay: timesPerDay,
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
    
    // Update user with all profile information
    const user = getUser();
    if (user) {
      const updatedUser = {
        ...user,
        name: name.trim(),
        age: typeof age === 'number' ? age : undefined,
        gender,
        collegeOrProfession: collegeOrProfession.trim(),
        hobbies,
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
      category: habitCategory,
      priority: habitPriority,
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
    sounds.success();
    
    // Update user with all profile information
    const user = getUser();
    if (user) {
      const updatedUser = {
        ...user,
        name: name.trim(),
        age: typeof age === 'number' ? age : undefined,
        gender,
        collegeOrProfession: collegeOrProfession.trim(),
        hobbies,
        hasCompletedOnboarding: true,
      };
      saveUser(updatedUser);
    }

    setShowCustomHabitForm(false);
    setShowAppIntroModal(true);
  };

  const handleIntroNext = () => {
    if (introScreen < 3) {
      setIntroScreen(introScreen + 1);
    } else if (introScreen === 3) {
      // Show welcome message screen
      setIntroScreen(4);
    } else {
      // After welcome message, go to home
      stopBackgroundMusic();
      router.push('/');
    }
  };

  const handleIntroSkip = () => {
    stopBackgroundMusic();
    router.push('/');
  };

  const totalSteps = 6;

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
              <span className="text-sm font-medium text-gray-600">Step {step} of {totalSteps}</span>
              <span className="text-sm font-medium text-gray-600">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-blue-100 mb-4">
                <span className="text-4xl">👋</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your name?</h2>
              <p className="text-gray-600">Let's personalize your experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

        {/* Step 2: Age */}
        {step === 2 && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-green-100 mb-4">
                <span className="text-4xl">🎂</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">How old are you?</h2>
              <p className="text-gray-600">This helps us suggest better habits</p>
            </div>

            <div className="space-y-6">
              <div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                  onKeyPress={(e) => e.key === 'Enter' && handleAgeSubmit()}
                  placeholder="Enter your age"
                  min="1"
                  max="150"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleAgeSubmit}
                  disabled={!age || age <= 0 || age >= 150}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Gender */}
        {step === 3 && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-purple-100 mb-4">
                <span className="text-4xl">👤</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your gender?</h2>
              <p className="text-gray-600">Help us personalize your experience</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setGender(option)}
                    className={`py-4 px-4 border-2 xl font-medium transition-all ${
                      gender === option
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleGenderSubmit}
                  disabled={!gender}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: College/Profession */}
        {step === 4 && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-orange-100 mb-4">
                <span className="text-4xl">🎓</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">College or Profession?</h2>
              <p className="text-gray-600">Tell us about your studies or work</p>
            </div>

            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  value={collegeOrProfession}
                  onChange={(e) => setCollegeOrProfession(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCollegeOrProfessionSubmit()}
                  placeholder="e.g., Computer Science Student or Software Engineer"
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleCollegeOrProfessionSubmit}
                  disabled={!collegeOrProfession.trim()}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Hobbies */}
        {step === 5 && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-pink-100 mb-4">
                <span className="text-4xl">🎨</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What are your hobbies?</h2>
              <p className="text-gray-600">Select or add your interests</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={currentHobby}
                    onChange={(e) => setCurrentHobby(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleHobbyAdd()}
                    placeholder="Add a hobby"
                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    onClick={handleHobbyAdd}
                    disabled={!currentHobby.trim() || hobbies.includes(currentHobby.trim())}
                    className="px-6 py-3 bg-blue-500 text-white xl font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {commonHobbies.map((hobby) => (
                    <button
                      key={hobby}
                      onClick={() => {
                        if (hobbies.includes(hobby)) {
                          handleHobbyRemove(hobby);
                        } else {
                          setHobbies([...hobbies, hobby]);
                        }
                      }}
                      className={`px-4 py-2 xl text-sm font-medium transition-all ${
                        hobbies.includes(hobby)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hobby} {hobbies.includes(hobby) && '✓'}
                    </button>
                  ))}
                </div>

                {hobbies.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 xl p-4">
                    <p className="text-sm font-medium text-blue-900 mb-2">Selected hobbies:</p>
                    <div className="flex flex-wrap gap-2">
                      {hobbies.map((hobby) => (
                        <span
                          key={hobby}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-blue-300 xl text-sm text-blue-700"
                        >
                          {hobby}
                          <button
                            onClick={() => handleHobbyRemove(hobby)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 py-4 bg-gray-100 text-gray-700 xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleHobbiesSubmit}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Habit Selection (with suggestions) */}
        {step === 6 && !showCustomHabitForm && (
          <div className="bg-white 3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 full bg-green-100 mb-4">
                <span className="text-4xl">💎</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your first habit</h2>
              <p className="text-gray-600">We've suggested habits based on your profile</p>
            </div>

            <div className="space-y-3">
              {suggestedHabits.map((habit, index) => (
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
                      {habit.reason && (
                        <p className="text-xs text-blue-600 mt-1">💡 {habit.reason}</p>
                      )}
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
        {step === 6 && showCustomHabitForm && (
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g., Morning Workout"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Emoji</label>
                <div className="flex items-center gap-3">
                  <EmojiPicker selectedEmoji={habitEmoji} onSelect={setHabitEmoji} />
                  <p className="text-sm text-gray-500">Choose an emoji for your habit</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  {HABIT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={habitPriority}
                  onChange={(e) => setHabitPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Times Per Day</label>
                <input
                  type="number"
                  value={timesPerDay}
                  onChange={(e) => setTimesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="10"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">How many times do you want to complete this habit per day?</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                <input
                  type="number"
                  value={totalDays}
                  onChange={(e) => setTotalDays(parseInt(e.target.value) || 30)}
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
                    setHabitCategory('Daily');
                    setHabitPriority('Medium');
                    setTimesPerDay(1);
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
                    Next
                    <ArrowRightIcon className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Screen 4: Welcome Message */}
              {introScreen === 4 && (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center space-y-8 max-w-2xl mx-auto">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mb-4">
                    <span className="text-6xl">🎉</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Welcome to Hira!</h2>
                  
                  <div className="w-full max-w-md space-y-4 text-left">
                    <div className="bg-white p-6 border border-gray-200">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">💰</span>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-2 text-lg">Earn & Redeem Real Money</p>
                          <p className="text-sm text-gray-600">
                            Complete habits to earn Hira. Redeem your Hira for real cash! (1 Hira = ₹1.5)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 border border-gray-200">
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">📱</span>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-2 text-lg">Share & Earn Extra</p>
                          <p className="text-sm text-gray-600">
                            Share your progress on social media after completing habits to earn an extra 0.5 Hira!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  </div>
                  
                  <button
                    onClick={handleIntroNext}
                    className="w-full max-w-md py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Got it!
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
