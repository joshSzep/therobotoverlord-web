#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix all remaining react/no-unescaped-entities errors
const entityFixes = [
  // Notifications page
  {
    file: 'src/app/notifications/page.tsx',
    search: "You're all caught up! No new notifications.",
    replace: "You&apos;re all caught up! No new notifications."
  },
  // User edit page
  {
    file: 'src/app/users/[userId]/edit/page.tsx',
    search: "Let's update your profile information.",
    replace: "Let&apos;s update your profile information."
  },
  // User page
  {
    file: 'src/app/users/[userId]/page.tsx',
    search: "This user hasn't posted anything yet.",
    replace: "This user hasn&apos;t posted anything yet."
  },
  {
    file: 'src/app/users/[userId]/page.tsx',
    search: "They're probably planning something big!",
    replace: "They&apos;re probably planning something big!"
  },
  // ErrorBoundary
  {
    file: 'src/components/ErrorBoundary.tsx',
    search: "We're sorry, something went wrong.",
    replace: "We&apos;re sorry, something went wrong."
  },
  // ContentFeed
  {
    file: 'src/components/feed/ContentFeed.tsx',
    search: "You're all caught up!",
    replace: "You&apos;re all caught up!"
  },
  // ModerationFilters
  {
    file: 'src/components/moderation/ModerationFilters.tsx',
    search: "Don't show",
    replace: "Don&apos;t show"
  }
];

// Fix quote entities in components (already fixed some, but checking remaining)
const quoteFixes = [
  // PostReporting
  {
    file: 'src/components/posts/PostReporting.tsx',
    search: 'Report "',
    replace: 'Report &quot;'
  },
  {
    file: 'src/components/posts/PostReporting.tsx', 
    search: '" for',
    replace: '&quot; for'
  },
  // PostSearchResults
  {
    file: 'src/components/posts/PostSearchResults.tsx',
    search: 'Search "',
    replace: 'Search &quot;'
  },
  {
    file: 'src/components/posts/PostSearchResults.tsx',
    search: '" in',
    replace: '&quot; in'
  },
  // SearchBar
  {
    file: 'src/components/search/SearchBar.tsx',
    search: 'Search "',
    replace: 'Search &quot;'
  },
  {
    file: 'src/components/search/SearchBar.tsx',
    search: '" in',
    replace: '&quot; in'
  }
];

function applyFixes(fixes, type) {
  console.log(`\nFixing ${type} entities...`);
  let fixedCount = 0;
  
  fixes.forEach(fix => {
    const filePath = path.join(__dirname, fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`✗ File not found: ${fix.file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes(fix.search)) {
      content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
      fs.writeFileSync(filePath, content);
      console.log(`✓ Fixed ${fix.file}`);
      fixedCount++;
    } else {
      console.log(`✗ Pattern not found in ${fix.file}: "${fix.search}"`);
    }
  });
  
  return fixedCount;
}

console.log('Fixing all remaining react/no-unescaped-entities errors...');

const apostropheFixed = applyFixes(entityFixes, 'apostrophe');
const quoteFixed = applyFixes(quoteFixes, 'quote');

console.log(`\nTotal fixes applied: ${apostropheFixed + quoteFixed}/${entityFixes.length + quoteFixes.length}`);
