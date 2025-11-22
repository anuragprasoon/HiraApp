import { useState } from 'react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { sounds } from '@/utils/sounds';

interface EmojiPickerProps {
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
  'Fitness': ['💪', '🏋️', '🏃', '🚴', '🧘', '🤸', '🏊', '⚽', '🏀', '🎾'],
  'Health': ['💧', '🥗', '🍎', '🥑', '🌙', '😴', '🧘', '💊', '🏥', '❤️'],
  'Learning': ['📚', '📖', '✍️', '🎓', '🧠', '💡', '📝', '✏️', '📊', '🎯'],
  'Work': ['💼', '📧', '💻', '📱', '🎨', '✏️', '📋', '✅', '🚀', '💡'],
  'Social': ['👥', '💬', '📞', '🎉', '🎊', '🎁', '🤝', '👋', '❤️', '😊'],
  'Creative': ['🎨', '🎭', '🎵', '🎸', '🎹', '🎤', '📷', '🎬', '✍️', '🖌️'],
  'Daily': ['☀️', '🌙', '⭐', '🌟', '🔥', '💫', '✨', '🎯', '✅', '📅'],
};

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

export default function EmojiPicker({ selectedEmoji, onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Daily');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center text-2xl border-2 border-gray-200"
      >
        {selectedEmoji || <FaceSmileIcon className="w-6 h-6 text-gray-400" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 bg-white 2xl shadow-2xl border border-gray-200 p-4 z-50 w-80 max-h-96 overflow-y-auto">
            {/* Category Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3 py-1.5 lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeCategory === category
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onSelect(emoji);
                    setIsOpen(false);
                  }}
                  className={`w-10 h-10 lg text-2xl hover:bg-gray-100 transition-all flex items-center justify-center ${
                    selectedEmoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick Access - All Emojis */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Quick Pick</p>
              <div className="grid grid-cols-10 gap-1">
                {ALL_EMOJIS.slice(0, 20).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSelect(emoji);
                      setIsOpen(false);
                    }}
                    className={`w-8 h-8 lg text-lg hover:bg-gray-100 transition-all flex items-center justify-center ${
                      selectedEmoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

