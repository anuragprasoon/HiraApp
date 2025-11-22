import { Habit, HabitPhoto } from '@/types';
import { formatDate } from '@/utils/storage';

interface SocialShareTemplateProps {
  habit: Habit;
  photo: HabitPhoto;
  onClose: () => void;
}

export default function SocialShareTemplate({ habit, photo, onClose }: SocialShareTemplateProps) {
  const shareImage = () => {
    // Create a canvas to generate the shareable image
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Background - solid black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1080);

    const loadPhoto = () => {
      // Load and draw the photo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Draw photo with rounded corners
        const photoSize = 600;
        const photoX = (1080 - photoSize) / 2;
        const photoY = 200;
        
        ctx.save();
        ctx.beginPath();
        const radius = 20;
        ctx.moveTo(photoX + radius, photoY);
        ctx.lineTo(photoX + photoSize - radius, photoY);
        ctx.quadraticCurveTo(photoX + photoSize, photoY, photoX + photoSize, photoY + radius);
        ctx.lineTo(photoX + photoSize, photoY + photoSize - radius);
        ctx.quadraticCurveTo(photoX + photoSize, photoY + photoSize, photoX + photoSize - radius, photoY + photoSize);
        ctx.lineTo(photoX + radius, photoY + photoSize);
        ctx.quadraticCurveTo(photoX, photoY + photoSize, photoX, photoY + photoSize - radius);
        ctx.lineTo(photoX, photoY + radius);
        ctx.quadraticCurveTo(photoX, photoY, photoX + radius, photoY);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
        ctx.restore();

        // Draw "Rise above the limit" text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'italic 42px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText('Rise above the limit', 540, 850);

        // Draw habit name
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 212, 255, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillText(habit.name, 540, 920);

        // Draw date
        ctx.fillStyle = '#ffffff';
        ctx.font = '32px Arial';
        ctx.shadowBlur = 0;
        ctx.fillText(formatDate(photo.date), 540, 980);

        // Draw Hira info
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(`${habit.totalHira} Hira Earned 💎`, 540, 1030);

        // Convert to blob and download/share
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hira-${habit.name}-${photo.date}.png`;
            link.click();
            URL.revokeObjectURL(url);
          }
        });
      };
      img.src = photo.photoData;
    };

    // Load logo first
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => {
      // Draw logo at the top center
      const logoSize = 120;
      const logoX = (1080 - logoSize) / 2;
      const logoY = 40;
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      
      // Continue with photo loading
      loadPhoto();
    };
    logoImg.onerror = () => {
      // If logo fails to load, continue without it
      loadPhoto();
    };
    logoImg.src = '/logo.png';
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-black border border-blue-500/20 2xl p-6 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Share Your Progress</h2>
        
        <div className="mb-6 bg-black 2xl p-4 border border-blue-500/10">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Hira Logo" 
              className="h-12 w-auto"
            />
          </div>
          <img
            src={photo.photoData}
            alt={habit.name}
            className="w-full xl mb-4"
          />
          <div className="text-center space-y-2">
            <p className="text-white text-base italic" style={{ fontFamily: "'Playfair Display', serif" }}>Rise above the limit</p>
            <h3 className="text-lg font-semibold text-blue-400 mb-1">{habit.name}</h3>
            <p className="text-gray-500 text-xs mb-2">{formatDate(photo.date)}</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 full bg-blue-500/10 border border-blue-500/20">
              <span className="text-lg">💎</span>
              <span className="text-blue-400 text-sm font-medium">{habit.totalHira} Hira 💎</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={shareImage}
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white xl hover:from-blue-600 hover:to-cyan-600 transition-all font-medium neon-glow-subtle"
          >
            Download Image
          </button>
          
          <div className="flex gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=Just completed ${habit.name}! Earned ${habit.totalHira} Hira! 💎&hashtags=HiraApp`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-black/50 text-white xl hover:bg-black/70 transition-colors text-center font-medium"
            >
              Twitter
            </a>
            <a
              href={`https://wa.me/?text=Just completed ${habit.name}! Earned ${habit.totalHira} Hira! 💎 Check out Hira App!`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-black/50 text-white xl hover:bg-black/70 transition-colors text-center font-medium"
            >
              WhatsApp
            </a>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-black/50 text-gray-300 xl hover:bg-black/70 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
