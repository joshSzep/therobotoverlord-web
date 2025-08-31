'use client';

import { useEffect, useCallback, useRef } from 'react';

// Hook for handling keyboard navigation in lists and grids
export const useKeyboardNavigation = (
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'grid';
    loop?: boolean;
    gridColumns?: number;
    onSelect?: (index: number) => void;
    onEscape?: () => void;
  } = {}
) => {
  const {
    orientation = 'vertical',
    loop = true,
    gridColumns = 1,
    onSelect,
    onEscape
  } = options;

  const currentIndexRef = useRef(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (items.length === 0) return;

    const currentIndex = currentIndexRef.current;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (orientation === 'vertical' || orientation === 'grid') {
          newIndex = orientation === 'grid' 
            ? Math.min(currentIndex + gridColumns, items.length - 1)
            : currentIndex + 1;
          if (loop && newIndex >= items.length) {
            newIndex = 0;
          }
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (orientation === 'vertical' || orientation === 'grid') {
          newIndex = orientation === 'grid'
            ? Math.max(currentIndex - gridColumns, 0)
            : currentIndex - 1;
          if (loop && newIndex < 0) {
            newIndex = items.length - 1;
          }
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = currentIndex + 1;
          if (loop && newIndex >= items.length) {
            newIndex = 0;
          }
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'horizontal' || orientation === 'grid') {
          newIndex = currentIndex - 1;
          if (loop && newIndex < 0) {
            newIndex = items.length - 1;
          }
        }
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect?.(currentIndex);
        break;

      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      default:
        return;
    }

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
      currentIndexRef.current = newIndex;
      items[newIndex]?.focus();
    }
  }, [items, orientation, loop, gridColumns, onSelect, onEscape]);

  const focusItem = useCallback((index: number) => {
    if (index >= 0 && index < items.length) {
      currentIndexRef.current = index;
      items[index]?.focus();
    }
  }, [items]);

  return {
    handleKeyDown,
    focusItem,
    currentIndex: currentIndexRef.current
  };
};

// Hook for managing focus within a container
export const useFocusManagement = () => {
  const containerRef = useRef<HTMLElement>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    return Array.from(
      containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
  }, []);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    elements[0]?.focus();
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    elements[elements.length - 1]?.focus();
  }, [getFocusableElements]);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, [getFocusableElements]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    trapFocus,
    getFocusableElements
  };
};

// Hook for dropdown/menu keyboard navigation
export const useDropdownNavigation = (
  isOpen: boolean,
  onClose: () => void,
  onSelect?: (index: number) => void
) => {
  const menuRef = useRef<HTMLElement>(null);
  const currentIndexRef = useRef(-1);

  const getMenuItems = useCallback(() => {
    if (!menuRef.current) return [];
    return Array.from(
      menuRef.current.querySelectorAll('[role="menuitem"], button, a')
    ) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    const items = getMenuItems();
    const currentIndex = currentIndexRef.current;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        currentIndexRef.current = nextIndex;
        items[nextIndex]?.focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        currentIndexRef.current = prevIndex;
        items[prevIndex]?.focus();
        break;

      case 'Home':
        event.preventDefault();
        currentIndexRef.current = 0;
        items[0]?.focus();
        break;

      case 'End':
        event.preventDefault();
        currentIndexRef.current = items.length - 1;
        items[items.length - 1]?.focus();
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex >= 0) {
          onSelect?.(currentIndex);
        }
        break;

      case 'Escape':
        event.preventDefault();
        onClose();
        break;

      case 'Tab':
        onClose();
        break;
    }
  }, [isOpen, getMenuItems, onSelect, onClose]);

  useEffect(() => {
    if (isOpen) {
      const items = getMenuItems();
      if (items.length > 0) {
        currentIndexRef.current = 0;
        items[0]?.focus();
      }
    } else {
      currentIndexRef.current = -1;
    }
  }, [isOpen, getMenuItems]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    menuRef,
    handleKeyDown
  };
};

// Hook for table keyboard navigation
export const useTableNavigation = (
  rows: number,
  columns: number,
  onCellSelect?: (row: number, col: number) => void
) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const currentCellRef = useRef({ row: 0, col: 0 });

  const getCellElement = useCallback((row: number, col: number) => {
    if (!tableRef.current) return null;
    const cell = tableRef.current.querySelector(
      `tr:nth-child(${row + 1}) td:nth-child(${col + 1}), tr:nth-child(${row + 1}) th:nth-child(${col + 1})`
    ) as HTMLElement;
    return cell;
  }, []);

  const focusCell = useCallback((row: number, col: number) => {
    const cell = getCellElement(row, col);
    if (cell) {
      cell.focus();
      currentCellRef.current = { row, col };
    }
  }, [getCellElement]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { row, col } = currentCellRef.current;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (row < rows - 1) {
          focusCell(row + 1, col);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (row > 0) {
          focusCell(row - 1, col);
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (col < columns - 1) {
          focusCell(row, col + 1);
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (col > 0) {
          focusCell(row, col - 1);
        }
        break;

      case 'Home':
        event.preventDefault();
        if (event.ctrlKey) {
          focusCell(0, 0);
        } else {
          focusCell(row, 0);
        }
        break;

      case 'End':
        event.preventDefault();
        if (event.ctrlKey) {
          focusCell(rows - 1, columns - 1);
        } else {
          focusCell(row, columns - 1);
        }
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        onCellSelect?.(row, col);
        break;
    }
  }, [rows, columns, focusCell, onCellSelect]);

  return {
    tableRef,
    handleKeyDown,
    focusCell
  };
};

// Hook for managing roving tabindex
export const useRovingTabIndex = (items: HTMLElement[], activeIndex: number = 0) => {
  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  const setActiveIndex = useCallback((newIndex: number) => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === newIndex ? 0 : -1;
        if (index === newIndex) {
          item.focus();
        }
      }
    });
  }, [items]);

  return { setActiveIndex };
};

// Hook for skip links
export const useSkipLinks = () => {
  const skipToContent = useCallback(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView();
    }
  }, []);

  const skipToNavigation = useCallback(() => {
    const navigation = document.getElementById('main-navigation');
    if (navigation) {
      navigation.focus();
      navigation.scrollIntoView();
    }
  }, []);

  return {
    skipToContent,
    skipToNavigation
  };
};

export default useKeyboardNavigation;
