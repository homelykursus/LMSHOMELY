'use client';

import { useState, useEffect } from 'react';

interface BadgeCounts {
  reminderCount: number;
  pendingStudentsCount: number;
}

export function useSidebarBadges() {
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    reminderCount: 0,
    pendingStudentsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadgeCounts = async () => {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') return;
      
      // Check if user is authenticated
      const user = localStorage.getItem('user');
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Fetch both counts in parallel
      const [reminderResponse, studentsResponse] = await Promise.allSettled([
        fetch('/api/payments/reminder-logic', {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('/api/students', {
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      let reminderCount = 0;
      let pendingStudentsCount = 0;

      // Process reminder response
      if (reminderResponse.status === 'fulfilled' && reminderResponse.value.ok) {
        try {
          const reminderData = await reminderResponse.value.json();
          if (Array.isArray(reminderData)) {
            reminderCount = reminderData.filter((student: any) => student.shouldShowReminder).length;
          }
        } catch (err) {
          console.warn('Failed to parse reminder data:', err);
        }
      } else if (reminderResponse.status === 'rejected') {
        console.warn('Reminder fetch failed:', reminderResponse.reason);
      }

      // Process students response
      if (studentsResponse.status === 'fulfilled' && studentsResponse.value.ok) {
        try {
          const studentsData = await studentsResponse.value.json();
          if (Array.isArray(studentsData)) {
            pendingStudentsCount = studentsData.filter((student: any) => student.status === 'pending').length;
          }
        } catch (err) {
          console.warn('Failed to parse students data:', err);
        }
      } else if (studentsResponse.status === 'rejected') {
        console.warn('Students fetch failed:', studentsResponse.reason);
      }

      setBadgeCounts({
        reminderCount,
        pendingStudentsCount,
      });
      setError(null);
    } catch (err) {
      console.warn('Error fetching badge counts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with delay to ensure authentication is ready
    const initialTimeout = setTimeout(fetchBadgeCounts, 1500);
    
    // Set up interval for periodic updates
    const interval = setInterval(fetchBadgeCounts, 30000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return {
    ...badgeCounts,
    isLoading,
    error,
    refresh: fetchBadgeCounts,
  };
}