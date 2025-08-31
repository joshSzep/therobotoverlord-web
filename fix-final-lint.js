#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Final ESLint fixes for remaining errors
const fixes = [
  // Fix search page any type
  {
    file: 'src/app/search/page.tsx',
    search: 'const searchParams = useSearchParams() as any;',
    replace: 'const searchParams = useSearchParams();'
  },
  // Fix logout page apostrophe
  {
    file: 'src/app/logout/page.tsx',
    search: "You've been logged out successfully.",
    replace: "You&apos;ve been logged out successfully."
  },
  // Fix not-found page apostrophes
  {
    file: 'src/app/not-found.tsx',
    search: "Let's get you back to safety.",
    replace: "Let&apos;s get you back to safety."
  },
  {
    file: 'src/app/not-found.tsx',
    search: "We couldn't find the page you're looking for.",
    replace: "We couldn&apos;t find the page you&apos;re looking for."
  },
  {
    file: 'src/app/not-found.tsx',
    search: "Don't worry, even the Robot Overlord gets lost sometimes.",
    replace: "Don&apos;t worry, even the Robot Overlord gets lost sometimes."
  },
  // Fix notifications page apostrophe
  {
    file: 'src/app/notifications/page.tsx',
    search: "You're all caught up! No new notifications.",
    replace: "You&apos;re all caught up! No new notifications."
  },
  // Fix user edit page apostrophe
  {
    file: 'src/app/users/[userId]/edit/page.tsx',
    search: "Let's update your profile information.",
    replace: "Let&apos;s update your profile information."
  },
  // Fix user page apostrophes
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
  // Fix ErrorBoundary apostrophe
  {
    file: 'src/components/ErrorBoundary.tsx',
    search: "We're sorry, something went wrong.",
    replace: "We&apos;re sorry, something went wrong."
  },
  // Fix ContentFeed apostrophe
  {
    file: 'src/components/feed/ContentFeed.tsx',
    search: "You're all caught up!",
    replace: "You&apos;re all caught up!"
  },
  // Fix ModerationFilters apostrophe
  {
    file: 'src/components/moderation/ModerationFilters.tsx',
    search: "Don't show",
    replace: "Don&apos;t show"
  }
];

function applyFix(fix) {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`✗ File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(fix.search)) {
    content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${fix.file}`);
    return true;
  } else {
    console.log(`✗ Pattern not found in ${fix.file}: "${fix.search}"`);
    return false;
  }
}

console.log('Applying final ESLint fixes...\n');

let fixedCount = 0;
fixes.forEach(fix => {
  if (applyFix(fix)) {
    fixedCount++;
  }
});

console.log(`\nApplied ${fixedCount}/${fixes.length} fixes.`);
