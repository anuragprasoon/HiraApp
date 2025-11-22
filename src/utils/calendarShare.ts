import { CalendarDay, User } from '@/types';
import { formatDate } from './storage';

export const generateCalendarImage = (calendarData: CalendarDay[], user: User): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920; // Instagram story size
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Urbanist';
    ctx.textAlign = 'center';
    ctx.fillText('Hira Activity', 540, 120);

    // User info
    ctx.font = '48px Urbanist';
    ctx.fillText(user.name, 540, 200);
    
    ctx.font = '36px Urbanist';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(`${user.totalHira} Hira Earned`, 540, 260);

    // Calendar grid - centered and larger
    const cellSize = 80;
    const spacing = 10;
    const daysPerRow = 7;
    const totalWidth = (cellSize + spacing) * daysPerRow - spacing;
    const startX = (1080 - totalWidth) / 2;
    const startY = 500;

    // Day labels
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    ctx.font = 'bold 40px Urbanist';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 7; i++) {
      const x = startX + i * (cellSize + spacing) + cellSize / 2;
      ctx.fillText(dayLabels[i], x, startY - 30);
    }

    // Calendar cells with rounded corners effect
    const getIntensityColor = (level: number): string => {
      switch (level) {
        case 0: return 'rgba(255, 255, 255, 0.15)';
        case 1: return 'rgba(255, 255, 255, 0.35)';
        case 2: return 'rgba(255, 255, 255, 0.55)';
        case 3: return 'rgba(255, 255, 255, 0.75)';
        case 4: return 'rgba(255, 255, 255, 0.95)';
        default: return 'rgba(255, 255, 255, 0.15)';
      }
    };

    // Calculate number of weeks needed
    const numWeeks = Math.ceil(calendarData.length / daysPerRow);
    const calendarHeight = numWeeks * (cellSize + spacing) - spacing;
    const calendarY = startY;

    calendarData.forEach((day, idx) => {
      const row = Math.floor(idx / daysPerRow);
      const col = idx % daysPerRow;
      const x = startX + col * (cellSize + spacing);
      const y = calendarY + row * (cellSize + spacing);

      // Draw rounded rectangle
      const radius = 8;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + cellSize - radius, y);
      ctx.quadraticCurveTo(x + cellSize, y, x + cellSize, y + radius);
      ctx.lineTo(x + cellSize, y + cellSize - radius);
      ctx.quadraticCurveTo(x + cellSize, y + cellSize, x + cellSize - radius, y + cellSize);
      ctx.lineTo(x + radius, y + cellSize);
      ctx.quadraticCurveTo(x, y + cellSize, x, y + cellSize - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      
      ctx.fillStyle = getIntensityColor(day.level);
      ctx.fill();
    });

    // Footer with better spacing
    const footerY = calendarY + calendarHeight + 100;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = 'bold 48px Urbanist';
    ctx.fillText('Hunt for Diamonds', 540, footerY);
    ctx.font = '36px Urbanist';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Hira App', 540, footerY + 60);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    resolve(dataUrl);
  });
};

