import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { Habit } from '@/types';
import { sounds } from '@/utils/sounds';
import { useRouter } from 'next/router';
import { getChallenges } from '@/utils/storage';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string) => void;
  onViewDetails?: (habit: Habit) => void;
}

const getHabitIcon = (habitName: string) => {
  const name = habitName.toLowerCase();
  if (name.includes('gym') || name.includes('workout') || name.includes('exercise')) {
    return '💪';
  } else if (name.includes('read') || name.includes('book')) {
    return '📚';
  } else if (name.includes('water') || name.includes('drink')) {
    return '💧';
  } else if (name.includes('meditat') || name.includes('plan')) {
    return '🧘';
  } else if (name.includes('sleep')) {
    return '🌙';
  } else if (name.includes('journal') || name.includes('write')) {
    return '📝';
  } else if (name.includes('design') || name.includes('ui')) {
    return '🎨';
  } else if (name.includes('work') || name.includes('deep')) {
    return '🧠';
  }
  return '⭐';
};

const getHabitColor = (index: number) => {
  // Minimal black/white/blue theme
  return 'bg-[#fafafa] border border-[#e5e5e5]';
};

export default function HabitCard({ habit, onComplete, onViewDetails }: HabitCardProps) {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const timesPerDay = habit.timesPerDay || 1;
  const todayCompletions = habit.completedDates.filter(date => date === today).length;
  const isFullyCompletedToday = todayCompletions >= timesPerDay;
  const habitIndex = parseInt(habit.id.split('_')[1] || '0') % 6;
  const displayEmoji = habit.emoji || getHabitIcon(habit.name);

  // Get challenge info if habit is part of a challenge
  const challenges = getChallenges();
  const challenge = habit.challengeId ? challenges.find(c => c.id === habit.challengeId) : null;

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-700 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleChallengeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (habit.challengeId) {
      router.push(`/challenge/${habit.challengeId}`);
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComplete(habit.id);
    sounds.complete();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open details if clicking the complete button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onViewDetails) {
      onViewDetails(habit);
    }
  };

  return (
    <>
      <div 
        className="bg-white border border-[#e5e5e5]  p-5 hover:border-[#0066ff] transition-all cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12  ${getHabitColor(habitIndex)} flex items-center justify-center text-2xl`}>
            {displayEmoji}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-base font-medium ${isFullyCompletedToday ? 'line-through text-gray-400' : 'text-black'}`}>
                    {habit.name}
                  </h3>
                  {habit.priority && (
                    <span className={`px-2 py-0.5 text-xs font-medium border ${getPriorityColor(habit.priority)}`}>
                      {habit.priority}
                    </span>
                  )}
                </div>
                {habit.category && (
                  <p className="text-xs text-gray-500 mb-1">{habit.category}</p>
                )}
                {timesPerDay > 1 && (
                  <p className="text-xs text-gray-500 mb-1">
                    {todayCompletions}/{timesPerDay} times today
                  </p>
                )}
                {challenge && (
                  <button
                    onClick={handleChallengeClick}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                  >
                    <TrophyIcon className="w-3.5 h-3.5" />
                    <span>View Challenge: {challenge.name}</span>
                  </button>
                )}
              </div>
              {isFullyCompletedToday ? (
                <CheckCircleIcon className="w-6 h-6 text-[#0066ff] flex-shrink-0 mt-1" />
              ) : (
                <div className="w-6 h-6 border-2 border-[#e5e5e5] flex-shrink-0 mt-1"></div>
              )}
            </div>
            
            {/* Hira Count */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💎</span>
              <span className="text-sm text-[#666666] font-medium">
                {habit.totalHira === 0 ? '' : `${habit.totalHira} Hira`}
              </span>
            </div>

            {/* Action Button */}
            {!isFullyCompletedToday && (
              <button
                onClick={handleComplete}
                className="w-full py-2.5 bg-black text-white font-medium hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2 text-sm border border-black"
              >
                Complete {timesPerDay > 1 && `(${todayCompletions + 1}/${timesPerDay})`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

