import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { initializeUser } from "@/utils/storage";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = initializeUser();
      
      // Redirect logic
      const currentPath = router.pathname;
      
      // If user hasn't completed onboarding and not on landing/onboarding pages
      if (!user.hasCompletedOnboarding && currentPath !== '/landing' && currentPath !== '/onboarding') {
        router.push('/landing');
        setIsChecking(false);
        return;
      }
      // If user completed onboarding and on landing page, go to home
      if (user.hasCompletedOnboarding && currentPath === '/landing') {
        router.push('/');
        setIsChecking(false);
        return;
      }
      
      setIsChecking(false);
    }
  }, [router.pathname]);

  // Show nothing while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}
