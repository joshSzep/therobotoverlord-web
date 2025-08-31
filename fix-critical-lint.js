#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Critical ESLint fixes needed for pre-commit
const fixes = [
  // react/no-unescaped-entities fixes
  {
    file: 'src/app/error.tsx',
    line: 54,
    search: "automatically reported to the Robot Overlord's maintenance division.",
    replace: "automatically reported to the Robot Overlord&apos;s maintenance division."
  },
  {
    file: 'src/app/error.tsx', 
    line: 143,
    search: "Let's get you back on track.",
    replace: "Let&apos;s get you back on track."
  },
  {
    file: 'src/app/login/page.tsx',
    line: 70,
    search: "Don't have an account?",
    replace: "Don&apos;t have an account?"
  },
  {
    file: 'src/app/login/page.tsx',
    line: 191,
    search: "We'll send you a magic link to sign in.",
    replace: "We&apos;ll send you a magic link to sign in."
  },
  {
    file: 'src/app/logout/page.tsx',
    line: 124,
    search: "You've been logged out successfully.",
    replace: "You&apos;ve been logged out successfully."
  },
  {
    file: 'src/app/not-found.tsx',
    line: 26,
    search: "We couldn't find the page you're looking for.",
    replace: "We couldn&apos;t find the page you&apos;re looking for."
  },
  {
    file: 'src/app/not-found.tsx',
    line: 42,
    search: "Don't worry, even the Robot Overlord gets lost sometimes.",
    replace: "Don&apos;t worry, even the Robot Overlord gets lost sometimes."
  },
  {
    file: 'src/app/not-found.tsx',
    line: 86,
    search: "Let's get you back to safety.",
    replace: "Let&apos;s get you back to safety."
  },
  {
    file: 'src/app/notifications/page.tsx',
    line: 433,
    search: "You're all caught up! No new notifications.",
    replace: "You&apos;re all caught up! No new notifications."
  },
  {
    file: 'src/app/users/[userId]/edit/page.tsx',
    line: 619,
    search: "Let's update your profile information.",
    replace: "Let&apos;s update your profile information."
  },
  {
    file: 'src/app/users/[userId]/page.tsx',
    line: 664,
    search: "This user hasn't posted anything yet. They're probably planning something big!",
    replace: "This user hasn&apos;t posted anything yet. They&apos;re probably planning something big!"
  },
  {
    file: 'src/components/ErrorBoundary.tsx',
    line: 74,
    search: "We're sorry, something went wrong.",
    replace: "We&apos;re sorry, something went wrong."
  },
  {
    file: 'src/components/feed/ContentFeed.tsx',
    line: 347,
    search: "You're all caught up!",
    replace: "You&apos;re all caught up!"
  },
  // prefer-const fixes
  {
    file: 'src/app/moderation/posts/page.tsx',
    line: 200,
    search: 'let endPage = Math.min(startPage + itemsPerPage - 1, totalItems);',
    replace: 'const endPage = Math.min(startPage + itemsPerPage - 1, totalItems);'
  },
  {
    file: 'src/app/moderation/topics/page.tsx',
    line: 206,
    search: 'let endPage = Math.min(startPage + itemsPerPage - 1, totalItems);',
    replace: 'const endPage = Math.min(startPage + itemsPerPage - 1, totalItems);'
  },
  {
    file: 'src/app/posts/search/page.tsx',
    line: 185,
    search: 'let endPage = Math.min(startPage + itemsPerPage - 1, totalItems);',
    replace: 'const endPage = Math.min(startPage + itemsPerPage - 1, totalItems);'
  },
  // no-explicit-any fix
  {
    file: 'src/app/search/page.tsx',
    line: 30,
    search: 'const searchParams = useSearchParams() as any;',
    replace: 'const searchParams = useSearchParams();'
  }
];

function applyFix(fix) {
  const filePath = path.join(__dirname, fix.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes(fix.search)) {
    content = content.replace(fix.search, fix.replace);
    fs.writeFileSync(filePath, content);
    console.log(`✓ Fixed ${fix.file}:${fix.line}`);
    return true;
  } else {
    console.log(`✗ Pattern not found in ${fix.file}:${fix.line} - "${fix.search}"`);
    return false;
  }
}

console.log('Applying critical ESLint fixes...\n');

let fixedCount = 0;
fixes.forEach(fix => {
  if (applyFix(fix)) {
    fixedCount++;
  }
});

console.log(`\nApplied ${fixedCount}/${fixes.length} fixes.`);
