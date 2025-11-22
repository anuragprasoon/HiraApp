import { useState } from 'react';
import { CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Habit } from '@/types';
import CameraCapture from './CameraCapture';
import { sounds } from '@/utils/sounds';

interface HabitCardProps {
  habit: Habit;
  onComplete: (habitId: string, photoData: string) => void;
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
  const [showCamera, setShowCamera] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);
  const habitIndex = parseInt(habit.id.split('_')[1] || '0') % 6;
  const displayEmoji = habit.emoji || getHabitIcon(habit.name);

  const handleCapture = (photoData: string) => {
    onComplete(habit.id, photoData);
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-black">{habit.name}</h3>
              {isCompletedToday ? (
                <CheckCircleIcon className="w-6 h-6 text-[#0066ff] flex-shrink-0" />
              ) : (
                <div className="w-6 h-6  border-2 border-[#e5e5e5] flex-shrink-0"></div>
              )}
            </div>
            
            {/* Hira Count */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💎</span>
              <span className="text-sm text-[#666666] font-medium">{habit.totalHira} Hira</span>
            </div>

            {/* Action Button */}
            {!isCompletedToday && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCamera(true);
                }}
                className="w-full py-2.5 bg-black text-white  font-medium hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2 text-sm border border-black"
              >
                <CameraIcon className="w-4 h-4" />
                Complete with Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraCapture
          habitName={habit.name}
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}

