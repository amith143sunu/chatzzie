'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // If already authorized, router pushes to dashboard
    if (typeof window !== 'undefined' && localStorage.getItem('chatzie_admin_auth') === 'true') {
      router.push('/admin');
    }
  }, [router]);

  // Layout handles rendering the login form when unauthorized
  return null;
}
