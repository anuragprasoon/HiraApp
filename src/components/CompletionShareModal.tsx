import { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, ShareIcon } from '@heroicons/react/24/solid';
import { Habit } from '@/types';

interface CompletionShareModalProps {
  habit: Habit;
  onClose: () => void;
}

const stockWallpapers = [
  { id: 1, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', name: 'Purple' },
  { id: 2, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', name: 'Pink' },
  { id: 3, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', name: 'Blue' },
  { id: 4, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', name: 'Green' },
  { id: 5, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', name: 'Sunset' },
  { id: 6, gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', name: 'Ocean' },
];

export default function CompletionShareModal({ habit, onClose }: CompletionShareModalProps) {
  const [selectedWallpaper, setSelectedWallpaper] = useState(stockWallpapers[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const streak = habit.completedDates.length;
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePoster = (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve('');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Set canvas size (Instagram story size: 1080x1920)
      canvas.width = 1080;
      canvas.height = 1920;

      // Draw background
      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Draw image as background with overlay
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Add dark overlay for better text visibility
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          drawWidget(ctx, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          drawGradientBackground(ctx, canvas.width, canvas.height);
          drawWidget(ctx, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = uploadedImage;
      } else {
        drawGradientBackground(ctx, canvas.width, canvas.height);
        drawWidget(ctx, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      }
    });
  };

  const drawGradientBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const colors = selectedWallpaper.gradient.match(/#[0-9a-f]{6}/gi) || ['#667eea', '#764ba2'];
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1] || colors[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawWidget = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw badge/icon at top center
    const badgeSize = 200;
    const badgeX = (width - badgeSize) / 2;
    const badgeY = height * 0.15;

    // Draw golden badge background
    const badgeGradient = ctx.createRadialGradient(
      badgeX + badgeSize / 2,
      badgeY + badgeSize / 2,
      0,
      badgeX + badgeSize / 2,
      badgeY + badgeSize / 2,
      badgeSize / 2
    );
    badgeGradient.addColorStop(0, '#FFD700');
    badgeGradient.addColorStop(1, '#FFA500');
    ctx.fillStyle = badgeGradient;
    ctx.beginPath();
    ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw laurel wreath icon (simplified)
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 8;
    ctx.beginPath();
    // Left side
    ctx.arc(badgeX + badgeSize / 2 - 30, badgeY + badgeSize / 2, 30, 0, Math.PI * 2);
    // Right side
    ctx.arc(badgeX + badgeSize / 2 + 30, badgeY + badgeSize / 2, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Draw streak text
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${streak} Day Streak!`, width / 2, badgeY + badgeSize + 150);

    // Draw encouragement text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.fillText('You are on the right track', width / 2, badgeY + badgeSize + 250);

    // Draw habit name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(habit.name, width / 2, height * 0.5);

    // Draw habit emoji
    ctx.font = '120px Arial';
    ctx.fillText(habit.emoji || '⭐', width / 2, height * 0.5 + 150);

    // Draw weekly progress
    const weekStartX = width / 2 - 300;
    const weekY = height * 0.65;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayWidth = 100;
    const spacing = 50;

    days.forEach((day, index) => {
      const x = weekStartX + index * (dayWidth + spacing);
      
      // Draw day label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(day, x + dayWidth / 2, weekY);

      // Draw circle for completed days (first 3)
      if (index < 3) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x + dayWidth / 2, weekY + 60, 25, 0, Math.PI * 2);
        ctx.stroke();
        // Draw checkmark
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(x + dayWidth / 2 - 10, weekY + 60);
        ctx.lineTo(x + dayWidth / 2 - 3, weekY + 70);
        ctx.lineTo(x + dayWidth / 2 + 12, weekY + 50);
        ctx.stroke();
      } else {
        // Draw date numbers for upcoming days
        const currentDate = new Date();
        const date = currentDate.getDate() + (index - 3);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(date.toString(), x + dayWidth / 2, weekY + 70);
      }
    });

    // Draw Hira points
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 60px Arial';
    ctx.fillText(`💎 ${habit.totalHira} Hira`, width / 2, height * 0.8);

    // Draw date
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '36px Arial';
    ctx.fillText(dateStr, width / 2, height * 0.85);

    // Draw app branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px Arial';
    ctx.fillText('Hira App', width / 2, height * 0.92);
  };

  const handleShare = async (platform: 'instagram' | 'twitter' | 'whatsapp') => {
    const imageData = await generatePoster();
    if (!imageData) return;

    const shareText = `I just completed "${habit.name}"! ${streak} day streak! 💪\n\n#HiraApp #HabitTracking`;

    if (platform === 'whatsapp') {
      // Download image first, then open WhatsApp
      downloadImage(imageData, `hira-${habit.name}-${Date.now()}.png`);
      setTimeout(() => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
      }, 500);
    } else if (platform === 'twitter') {
      // Twitter doesn't support direct image sharing via URL, so download and let user upload
      downloadImage(imageData, `hira-${habit.name}-${Date.now()}.png`);
      setTimeout(() => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
      }, 500);
    } else if (platform === 'instagram') {
      // For Instagram, download the image and let user upload manually
      downloadImage(imageData, `hira-${habit.name}-${Date.now()}.png`);
      alert('Image downloaded! You can now upload it to Instagram Stories or Feed.');
    }
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  useEffect(() => {
    // Generate preview when component mounts or selections change
    const generatePreview = async () => {
      // Small delay to ensure canvas is ready
      setTimeout(async () => {
        const image = await generatePoster();
        if (image) {
          setPosterImage(image);
        }
      }, 100);
    };
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWallpaper, uploadedImage, habit, streak]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Celebration Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
          <p className="text-lg text-gray-600">
            You completed <span className="font-semibold">{habit.name}</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {streak} day streak! Keep it up! 🔥
          </p>
        </div>

        {/* Poster Preview */}
        <div className="mb-6 bg-gray-100 rounded-xl p-4">
          <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
            />
            {posterImage ? (
              <img
                src={posterImage}
                alt="Completion poster"
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full relative"
                style={{
                  background: uploadedImage 
                    ? `url(${uploadedImage}) center/cover` 
                    : selectedWallpaper.gradient,
                }}
              >
                {/* Widget Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                  {/* Badge */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-4xl">🏆</span>
                  </div>
                  
                  {/* Streak */}
                  <h3 className="text-4xl font-bold mb-2">{streak} Day Streak!</h3>
                  <p className="text-lg mb-6 opacity-90">You are on the right track</p>
                  
                  {/* Habit Info */}
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-2">{habit.emoji || '⭐'}</div>
                    <h4 className="text-2xl font-bold">{habit.name}</h4>
                  </div>
                  
                  {/* Weekly Progress */}
                  <div className="flex gap-3 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                      <div key={day} className="text-center">
                        <div className="text-xs mb-1 opacity-80">{day}</div>
                        {idx < 3 ? (
                          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xs font-bold">{new Date().getDate() + idx - 2}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Hira Points */}
                  <div className="text-xl font-bold">
                    💎 {habit.totalHira} Hira
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Options */}
        <div className="mb-6 space-y-3">
          <button
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <ShareIcon className="w-5 h-5" />
            Share on Social Media
          </button>

          {showShareOptions && (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in duration-200">
              <button
                onClick={() => handleShare('instagram')}
                className="py-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="py-3 bg-gradient-to-br from-blue-400 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="py-3 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm flex flex-col items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Wallpaper Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Background
          </label>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {stockWallpapers.map((wallpaper) => (
              <button
                key={wallpaper.id}
                onClick={() => {
                  setSelectedWallpaper(wallpaper);
                  setUploadedImage(null);
                }}
                className={`aspect-square rounded-lg border-2 transition-all ${
                  selectedWallpaper.id === wallpaper.id && !uploadedImage
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ background: wallpaper.gradient }}
                title={wallpaper.name}
              />
            ))}
          </div>
          
          {/* Upload from Gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors flex items-center justify-center gap-2 text-gray-600"
          >
            <PhotoIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Upload from Gallery</span>
          </button>
          {uploadedImage && (
            <button
              onClick={() => {
                setUploadedImage(null);
                setSelectedWallpaper(stockWallpapers[0]);
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700"
            >
              Remove uploaded image
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
        >
          Maybe Later
        </button>
      </div>
    </div>
  );
}

