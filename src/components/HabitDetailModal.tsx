import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { Habit, HabitPhoto } from '@/types';
import { formatDate } from '@/utils/storage';

interface HabitDetailModalProps {
  habit: Habit;
  photos: HabitPhoto[];
  onClose: () => void;
}

export default function HabitDetailModal({ habit, photos, onClose }: HabitDetailModalProps) {
  const habitPhotos = photos.filter(p => p.habitId === habit.id);
  const totalCompletions = habit.completedDates.length;
  const completionRate = habit.totalDays 
    ? Math.round((totalCompletions / habit.totalDays) * 100) 
    : 0;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white 3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{habit.emoji || '⭐'}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{habit.name}</h2>
              <p className="text-sm text-gray-500">Created {formatDate(habit.createdAt)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 2xl p-4 text-center border-2 border-blue-100">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">💎</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{habit.totalHira}</p>
            <p className="text-xs text-gray-600 mt-1">Total Hira</p>
          </div>
          <div className="bg-green-50 2xl p-4 text-center border-2 border-green-100">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalCompletions}</p>
            <p className="text-xs text-gray-600 mt-1">Completions</p>
          </div>
          <div className="bg-purple-50 2xl p-4 text-center border-2 border-purple-100">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">📸</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{habitPhotos.length}</p>
            <p className="text-xs text-gray-600 mt-1">Photos</p>
          </div>
        </div>

        {/* Progress */}
        {habit.totalDays && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Progress</p>
              <p className="text-sm font-bold text-blue-600">{completionRate}%</p>
            </div>
            <div className="w-full bg-gray-200 full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalCompletions} of {habit.totalDays} days completed
            </p>
          </div>
        )}

        {/* Photos Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PhotoIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Progress Photos</h3>
          </div>
          {habitPhotos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 2xl border-2 border-dashed border-gray-200">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No photos yet</p>
              <p className="text-sm text-gray-500 mt-1">Complete your habit to add photos!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {habitPhotos
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square xl overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all cursor-pointer group relative"
                  >
                    <img
                      src={photo.photoData}
                      alt={habit.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatDate(photo.date)}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

