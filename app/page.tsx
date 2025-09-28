'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SignIn from '@/components/auth/SignIn';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Loading Arena...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Redirecting to Dashboard...</span>
        </div>
      </div>
    </div>
  );
}
