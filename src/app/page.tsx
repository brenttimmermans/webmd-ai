'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/chat');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Link
        href="/chat"
        className="rounded-full bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to chat
      </Link>
    </div>
  );
}
