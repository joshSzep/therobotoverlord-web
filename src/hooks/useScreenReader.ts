'use client';

import { useCallback, useRef, useEffect } from 'react';

// Hook for managing screen reader announcements
export const useScreenReader = () => {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create live region if it doesn't exist
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let liveRegion = document.getElementById('screen-reader-announcements') as HTMLDivElement;
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'screen-reader-announcements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    
    liveRegionRef.current = liveRegion;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current || !message.trim()) return;

    // Clear any pending announcements
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the priority
    liveRegionRef.current.setAttribute('aria-live', priority);
    
    // Clear previous content first
    liveRegionRef.current.textContent = '';
    
    // Add new content after a brief delay to ensure screen readers pick it up
    timeoutRef.current = setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = message;
      }
    }, 100);
  }, []);

  // Announce with assertive priority (interrupts current speech)
  const announceImportant = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return {
    announce,
    announceImportant
  };
};

// Hook for form validation announcements
export const useFormAnnouncements = () => {
  const { announce, announceImportant } = useScreenReader();

  const announceFieldError = useCallback((fieldName: string, error: string) => {
    announceImportant(`Error in ${fieldName}: ${error}`);
  }, [announceImportant]);

  const announceFieldSuccess = useCallback((fieldName: string) => {
    announce(`${fieldName} is valid`);
  }, [announce]);

  const announceFormSubmission = useCallback((success: boolean, message?: string) => {
    if (success) {
      announce(message || 'Form submitted successfully');
    } else {
      announceImportant(message || 'Form submission failed. Please check for errors.');
    }
  }, [announce, announceImportant]);

  return {
    announceFieldError,
    announceFieldSuccess,
    announceFormSubmission
  };
};

// Hook for navigation announcements
export const useNavigationAnnouncements = () => {
  const { announce } = useScreenReader();

  const announcePageChange = useCallback((pageName: string) => {
    announce(`Navigated to ${pageName}`);
  }, [announce]);

  const announceTabChange = useCallback((tabName: string) => {
    announce(`Switched to ${tabName} tab`);
  }, [announce]);

  const announceModalOpen = useCallback((modalTitle: string) => {
    announce(`${modalTitle} dialog opened`);
  }, [announce]);

  const announceModalClose = useCallback(() => {
    announce('Dialog closed');
  }, [announce]);

  return {
    announcePageChange,
    announceTabChange,
    announceModalOpen,
    announceModalClose
  };
};

// Hook for data loading announcements
export const useLoadingAnnouncements = () => {
  const { announce, announceImportant } = useScreenReader();

  const announceLoadingStart = useCallback((resource: string) => {
    announce(`Loading ${resource}`);
  }, [announce]);

  const announceLoadingComplete = useCallback((resource: string, count?: number) => {
    const message = count !== undefined 
      ? `Loaded ${count} ${resource}${count !== 1 ? 's' : ''}`
      : `${resource} loaded`;
    announce(message);
  }, [announce]);

  const announceLoadingError = useCallback((resource: string, error?: string) => {
    announceImportant(`Failed to load ${resource}${error ? `: ${error}` : ''}`);
  }, [announceImportant]);

  const announceEmptyState = useCallback((resource: string) => {
    announce(`No ${resource} found`);
  }, [announce]);

  return {
    announceLoadingStart,
    announceLoadingComplete,
    announceLoadingError,
    announceEmptyState
  };
};

// Hook for action announcements
export const useActionAnnouncements = () => {
  const { announce, announceImportant } = useScreenReader();

  const announceActionSuccess = useCallback((action: string, target?: string) => {
    const message = target ? `${action} ${target} successfully` : `${action} completed successfully`;
    announce(message);
  }, [announce]);

  const announceActionError = useCallback((action: string, error?: string, target?: string) => {
    const message = target 
      ? `Failed to ${action} ${target}${error ? `: ${error}` : ''}`
      : `${action} failed${error ? `: ${error}` : ''}`;
    announceImportant(message);
  }, [announceImportant]);

  const announceSelectionChange = useCallback((selected: string | number, total?: number) => {
    const message = total !== undefined 
      ? `${selected} of ${total} selected`
      : `Selected ${selected}`;
    announce(message);
  }, [announce]);

  const announceFilterChange = useCallback((filterType: string, value: string, resultCount?: number) => {
    const message = resultCount !== undefined
      ? `Filtered by ${filterType}: ${value}. ${resultCount} results found`
      : `Filtered by ${filterType}: ${value}`;
    announce(message);
  }, [announce]);

  return {
    announceActionSuccess,
    announceActionError,
    announceSelectionChange,
    announceFilterChange
  };
};

// Hook for status announcements
export const useStatusAnnouncements = () => {
  const { announce, announceImportant } = useScreenReader();

  const announceStatusChange = useCallback((item: string, oldStatus: string, newStatus: string) => {
    announce(`${item} status changed from ${oldStatus} to ${newStatus}`);
  }, [announce]);

  const announceNotification = useCallback((type: 'info' | 'warning' | 'error' | 'success', message: string) => {
    const priority = type === 'error' || type === 'warning' ? 'assertive' : 'polite';
    const announcement = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${message}`;
    
    if (priority === 'assertive') {
      announceImportant(announcement);
    } else {
      announce(announcement);
    }
  }, [announce, announceImportant]);

  const announceProgress = useCallback((current: number, total: number, task?: string) => {
    const percentage = Math.round((current / total) * 100);
    const message = task 
      ? `${task}: ${percentage}% complete (${current} of ${total})`
      : `${percentage}% complete (${current} of ${total})`;
    announce(message);
  }, [announce]);

  return {
    announceStatusChange,
    announceNotification,
    announceProgress
  };
};

// Hook for search announcements
export const useSearchAnnouncements = () => {
  const { announce } = useScreenReader();

  const announceSearchStart = useCallback((query: string) => {
    announce(`Searching for "${query}"`);
  }, [announce]);

  const announceSearchResults = useCallback((query: string, count: number) => {
    const message = count === 0 
      ? `No results found for "${query}"`
      : `Found ${count} result${count !== 1 ? 's' : ''} for "${query}"`;
    announce(message);
  }, [announce]);

  const announceSuggestion = useCallback((suggestion: string, position: number, total: number) => {
    announce(`Suggestion ${position} of ${total}: ${suggestion}`);
  }, [announce]);

  return {
    announceSearchStart,
    announceSearchResults,
    announceSuggestion
  };
};

export default useScreenReader;
