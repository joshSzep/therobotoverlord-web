'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useKeyboardNavigation, useDropdownNavigation, useFocusManagement } from '@/hooks/useKeyboardNavigation';

// Keyboard accessible dropdown menu
export const KeyboardDropdown: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect?: (index: number) => void;
  className?: string;
}> = ({ trigger, children, isOpen, onToggle, onClose, onSelect, className }) => {
  const { menuRef, handleKeyDown } = useDropdownNavigation(isOpen, onClose, onSelect);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !isOpen) {
            e.preventDefault();
            onToggle();
          } else if (e.key === 'Escape' && isOpen) {
            onClose();
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2"
      >
        {trigger}
      </button>
      
      {isOpen && (
        <div
          ref={menuRef as React.RefObject<HTMLDivElement>}
          role="menu"
          className="absolute z-50 mt-1 bg-card border border-border rounded-md shadow-lg"
          onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Keyboard accessible menu item
export const KeyboardMenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, disabled = false, className }) => (
  <button
    role="menuitem"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'w-full text-left px-4 py-2 text-sm hover:bg-muted focus:bg-muted focus:outline-none',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    tabIndex={-1}
  >
    {children}
  </button>
);

// Keyboard accessible tabs
export const KeyboardTabs: React.FC<{
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onTabChange, className }) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = index === 0 ? tabs.length - 1 : index - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }
    
    tabRefs.current[newIndex]?.focus();
    if (tabs[newIndex]) {
      onTabChange(tabs[newIndex].id);
    }
  };

  return (
    <div className={className}>
      <div role="tablist" className="flex border-b border-border">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2',
              activeTab === tab.id
                ? 'border-overlord-red text-overlord-red'
                : 'border-transparent text-muted-light hover:text-light-text hover:border-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="mt-4"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

// Keyboard accessible list with arrow navigation
export const KeyboardList: React.FC<{
  items: Array<{ id: string; content: React.ReactNode; onClick?: () => void }>;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}> = ({ items, className, orientation = 'vertical' }) => {
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    
    const isVertical = orientation === 'vertical';
    const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        newIndex = (index + 1) % items.length;
        break;
      case prevKey:
        event.preventDefault();
        newIndex = index === 0 ? items.length - 1 : index - 1;
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
        if (items[index]) {
          items[index].onClick?.();
        }
        break;
      default:
        return;
    }
    
    itemRefs.current[newIndex]?.focus();
  };

  return (
    <ul role="list" className={cn('space-y-2', className)}>
      {items.map((item, index) => (
        <li
          key={item.id}
          ref={(el) => { itemRefs.current[index] = el; }}
          role="listitem"
          tabIndex={index === 0 ? 0 : -1}
          onClick={item.onClick}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2 cursor-pointer"
        >
          {item.content}
        </li>
      ))}
    </ul>
  );
};

// Keyboard accessible modal with focus management
export const KeyboardModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className }) => {
  const { containerRef, focusFirst, trapFocus } = useFocusManagement();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => focusFirst(), 100);
    } else {
      document.body.style.overflow = 'unset';
      previousFocusRef.current?.focus();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, focusFirst]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        onClose();
      } else {
        trapFocus(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, trapFocus]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={cn(
          'bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl',
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 id="modal-title" className="text-xl font-bold text-light-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-muted-light hover:text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2 rounded"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Keyboard accessible search with autocomplete
export const KeyboardSearch: React.FC<{
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  onSelect?: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, suggestions = [], onSelect, placeholder, className }) => {
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSelect?.(suggestions[selectedIndex]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        aria-expanded={showSuggestions}
        aria-haspopup="listbox"
        aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        className="w-full px-3 py-2 border border-border rounded-md bg-card text-light-text focus:outline-none focus:ring-2 focus:ring-overlord-red focus:ring-offset-2"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => {
                onSelect?.(suggestion);
                setShowSuggestions(false);
              }}
              className={cn(
                'px-3 py-2 cursor-pointer',
                index === selectedIndex
                  ? 'bg-overlord-red text-white'
                  : 'text-light-text hover:bg-muted'
              )}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export {
  KeyboardDropdown as default,
};
