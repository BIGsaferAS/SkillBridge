'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back button on the landing page
  if (pathname === '/') {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full shadow-lg hover:scale-105 transition-transform"
      title="Geri Dön"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    </button>
  );
}
