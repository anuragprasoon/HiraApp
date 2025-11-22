import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import { PlusIcon, CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HomeIcon, UserGroupIcon, TrophyIcon, UserIcon, ShareIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { playBackgroundMusic } from '@/utils/backgroundMusic';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={`bg-white/5 border border-white/10 p-6 space-y-4 transition-all duration-700 ease-out hover:bg-white/10 hover:border-white/20 hover:scale-105 cursor-pointer ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="w-16 h-16 bg-white/10 border border-white/20 flex items-center justify-center text-white transition-transform duration-300 hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    // Start background music when component mounts
    playBackgroundMusic();
  }, []);

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  const handleLogin = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="flex items-center justify-center px-6 py-12 min-h-screen">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            <div>
              <div className="mb-6">
                <img 
                  src="/logo.png" 
                  alt="Hira Logo" 
                  className="h-16 md:h-20 w-auto"
                />
              </div>
              <h1 className="text-7xl md:text-8xl font-bold text-white mb-6 leading-tight">
                Hira
              </h1>
              <p className="text-2xl md:text-3xl text-white/80 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                Track your habits, earn Hira, build consistency
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-black font-medium text-base hover:bg-white/90 transition-all"
              >
                Get Started
              </button>
              <button
                onClick={handleLogin}
                className="px-8 py-4 bg-transparent text-white font-medium text-base hover:bg-white/10 transition-all border border-white/20"
              >
                Continue Journey
              </button>
            </div>
          </div>

        {/* Right Side - Phone Mockup */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-[320px] h-[640px] bg-gray-900 shadow-2xl" style={{ borderRadius: '40px', padding: '8px' }}>
            {/* Phone Frame Outer */}
            <div className="w-full h-full bg-white overflow-hidden relative" style={{ borderRadius: '32px' }}>
              {/* Status Bar */}
              <div className="h-7 bg-white flex items-center justify-between px-5 text-[10px] text-black font-medium">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-2 border border-black"></div>
                  <div className="w-5 h-2.5 border border-black"></div>
                </div>
              </div>

              {/* App Content */}
              <div className="bg-white h-[calc(100%-28px)] overflow-hidden relative">
                {/* Header */}
                <div className="bg-white border-b border-[#e5e5e5] px-5 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600"></div>
                      <div>
                        <h2 className="text-base text-black font-medium">Good Evening, Prasoon</h2>
                        <p className="text-[10px] text-[#666666]">Monday, January 15</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#fafafa] px-2.5 py-1 border border-[#e5e5e5]">
                      <span className="text-base">💎</span>
                      <span className="text-xs font-medium text-black">0</span>
                      <span className="text-[10px] text-[#666666]">Hira</span>
                    </div>
                  </div>

                  {/* Progress Card */}
                  <div className="bg-[#fafafa] border border-[#e5e5e5] p-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-[#666666] mb-0.5">Today's Progress</p>
                        <p className="text-base text-black font-medium">0/0 habits completed</p>
                      </div>
                      <div className="relative w-11 h-11">
                        <svg className="transform -rotate-90 w-11 h-11">
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke="#e5e5e5"
                            strokeWidth="3"
                            fill="none"
                          />
                          <circle
                            cx="22"
                            cy="22"
                            r="18"
                            stroke="#0066ff"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 18}`}
                            strokeDashoffset={`${2 * Math.PI * 18}`}
                            strokeLinecap="butt"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-black">0%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Habits List */}
                <div className="px-5 py-3 space-y-2.5 pb-20">
                  {/* Habit Card 1 */}
                  <div className="bg-white border border-[#e5e5e5] p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 flex items-center justify-center text-lg">
                        💪
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-sm text-black font-medium">Morning Workout</h3>
                          <div className="w-5 h-5 border-2 border-[#e5e5e5]"></div>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-base">💎</span>
                          <span className="text-[11px] text-[#666666] font-medium">0 Hira</span>
                        </div>
                        <button className="w-full py-2 bg-black text-white text-[11px] font-medium flex items-center justify-center gap-1.5 border border-black">
                          <CameraIcon className="w-3.5 h-3.5" />
                          Complete with Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Habit Card 2 */}
                  <div className="bg-white border border-[#e5e5e5] p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 flex items-center justify-center text-lg">
                        📚
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-sm text-black font-medium">Read 20 Pages</h3>
                          <div className="w-5 h-5 border-2 border-[#e5e5e5]"></div>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-base">💎</span>
                          <span className="text-[11px] text-[#666666] font-medium">0 Hira</span>
                        </div>
                        <button className="w-full py-2 bg-black text-white text-[11px] font-medium flex items-center justify-center gap-1.5 border border-black">
                          <CameraIcon className="w-3.5 h-3.5" />
                          Complete with Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAB */}
                <div className="absolute bottom-20 right-5">
                  <button className="w-11 h-11 bg-black text-white flex items-center justify-center border border-black">
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Bottom Navigation */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5]">
                  <div className="flex justify-around items-center h-14 px-2">
                    <div className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5">
                      <HomeIcon className="w-5 h-5 text-[#0066ff]" />
                      <span className="text-[9px] font-medium text-[#0066ff]">Home</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5">
                      <UserGroupIcon className="w-5 h-5 text-[#666666]" />
                      <span className="text-[9px] font-medium text-[#666666]">Challenges</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5">
                      <TrophyIcon className="w-5 h-5 text-[#666666]" />
                      <span className="text-[9px] font-medium text-[#666666]">Rewards</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5">
                      <UserIcon className="w-5 h-5 text-[#666666]" />
                      <span className="text-[9px] font-medium text-[#666666]">Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Story & Features Section */}
      <div className="px-6 py-24 border-t border-white/10 relative overflow-hidden">
        {/* Background "MOBILE APP" text */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-full text-center pointer-events-none">
          <h2 className="text-8xl md:text-9xl font-bold text-white/5 select-none">MOBILE APP</h2>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Story Section */}
          <div className="text-center mb-20 space-y-6">
            <div className="space-y-4 text-xl md:text-2xl text-white/70 leading-relaxed">
              <p>Other apps give you checkboxes.</p>
              <p className="text-white text-2xl md:text-3xl font-medium">
                Hira gives you proof, diamonds, rewards, and a story worth sharing.
              </p>
              <p className="text-white/60 text-lg md:text-xl italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                Because good habits deserve more than a tick mark—they deserve the spotlight.
              </p>
            </div>
          </div>

          {/* Features Grid with Phone */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - 3 Feature Cards */}
            <div className="lg:col-span-4 space-y-6">
              <FeatureCard
                icon={<ShareIcon className="w-8 h-8" />}
                title="Social Proof"
                description="Share your progress with photo verification. Every habit completed is a moment captured, a story told, a journey shared."
                delay={0}
              />
              <FeatureCard
                icon={<span className="text-4xl">💎</span>}
                title="Rewards"
                description="Earn Hira with every completion. Unlock exclusive rewards, discounts, and experiences. Your consistency pays off."
                delay={0.1}
              />
              <FeatureCard
                icon={<UserGroupIcon className="w-8 h-8" />}
                title="Challenges"
                description="Join community challenges. Create your own. Compete, collaborate, and celebrate together. Habits are better shared."
                delay={0.2}
              />
            </div>

            {/* Center Column - Phone Mockup */}
            <div className="lg:col-span-4 flex flex-col items-center space-y-6">
              {/* "Go mobile" Card */}
              <div className="w-full bg-white/5 border border-white/10 p-6 text-center space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 mx-auto bg-white/10 border border-white/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Go mobile</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Our habit tracking mobile app is designed to simplify and supercharge your productivity.
                </p>
              </div>

              {/* Phone Mockup */}
              <div className="relative w-[280px] h-[560px] bg-gray-900 shadow-2xl animate-float" style={{ borderRadius: '40px', padding: '8px' }}>
                <div className="w-full h-full bg-white overflow-hidden relative" style={{ borderRadius: '32px' }}>
                  {/* Status Bar */}
                  <div className="h-7 bg-white flex items-center justify-between px-5 text-[10px] text-black font-medium">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 border border-black"></div>
                      <div className="w-5 h-2.5 border border-black"></div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="bg-white h-[calc(100%-28px)] overflow-hidden relative">
                    {/* Header */}
                    <div className="bg-white border-b border-[#e5e5e5] px-5 py-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600"></div>
                          <div>
                            <h2 className="text-base text-black font-medium">Good Evening</h2>
                            <p className="text-[10px] text-[#666666]">Monday, January 15</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#fafafa] px-2.5 py-1 border border-[#e5e5e5]">
                          <span className="text-base">💎</span>
                          <span className="text-xs font-medium text-black">0</span>
                        </div>
                      </div>
                    </div>

                    {/* Habits List */}
                    <div className="px-5 py-3 space-y-2.5">
                      <div className="bg-white border border-[#e5e5e5] p-3.5">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 flex items-center justify-center text-lg">
                            💪
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm text-black font-medium mb-1.5">Morning Workout</h3>
                            <div className="flex items-center gap-1.5 mb-2">
                              <span className="text-base">💎</span>
                              <span className="text-[11px] text-[#666666] font-medium">0 Hira</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5]">
                      <div className="flex justify-around items-center h-14 px-2">
                        <HomeIcon className="w-5 h-5 text-[#0066ff]" />
                        <UserGroupIcon className="w-5 h-5 text-[#666666]" />
                        <TrophyIcon className="w-5 h-5 text-[#666666]" />
                        <UserIcon className="w-5 h-5 text-[#666666]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description below phone */}
              <p className="text-center text-white/60 text-sm leading-relaxed max-w-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                Easily access all app features with a user-friendly, intuitive menu design that streamlines navigation and enhances productivity.
              </p>
            </div>

            {/* Right Column - 3 Feature Cards */}
            <div className="lg:col-span-4 space-y-6">
              <FeatureCard
                icon={<PhotoIcon className="w-8 h-8" />}
                title="Photo Verification"
                description="Capture your progress with timestamped photos. No checkboxes—just real proof of your commitment and consistency."
                delay={0.5}
              />
              <FeatureCard
                icon={<span className="text-4xl">💎</span>}
                title="Hira System"
                description="Earn diamonds for every completed habit. Watch your Hira grow as you build consistency and achieve your goals."
                delay={0.6}
              />
              <FeatureCard
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>}
                title="Activity Calendar"
                description="Visualize your journey with a beautiful 30-day activity calendar. See your progress at a glance and stay motivated."
                delay={0.7}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="px-6 py-24 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <button
            onClick={handleGetStarted}
            className="px-12 py-4 bg-white text-black font-medium text-base hover:bg-white/90 transition-all animate-fade-in-up"
            style={{ animationDelay: '0.8s' }}
          >
            Get App
          </button>
        </div>
      </div>
    </div>
  );
}

