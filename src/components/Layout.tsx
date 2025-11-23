import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  UserIcon,
  TrophyIcon,
  UserGroupIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserIcon as UserIconSolid,
  TrophyIcon as TrophyIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navItems = [
    { path: '/', icon: HomeIcon, iconSolid: HomeIconSolid, label: 'Home' },
    { path: '/challenges', icon: UserGroupIcon, iconSolid: UserGroupIconSolid, label: 'Challenges' },
    { path: '/friends', icon: UserCircleIcon, iconSolid: UserCircleIconSolid, label: 'Friends' },
    { path: '/rewards', icon: TrophyIcon, iconSolid: TrophyIconSolid, label: 'Rewards' },
    { path: '/profile', icon: UserIcon, iconSolid: UserIconSolid, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="pb-20">{children}</main>
      
      {/* Bottom Navigation - Minimal */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5]">
        <div className="flex justify-around items-center h-16 px-2 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            const Icon = isActive ? item.iconSolid : item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all ${
                  isActive
                    ? 'text-[#0066ff]'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={`text-[10px] font-medium ${
                  isActive ? 'text-[#0066ff]' : 'text-[#666666]'
                }`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

