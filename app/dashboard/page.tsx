'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LibraryDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/books');
  }, [router]);

  return null;
}
