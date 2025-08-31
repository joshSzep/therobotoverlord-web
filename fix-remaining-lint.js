#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with react/no-unescaped-entities errors
const reactEntityFixes = [
  {
    file: 'src/app/error.tsx',
    fixes: [
      { search: "We're sorry, but something went wrong.", replace: "We&apos;re sorry, but something went wrong." },
      { search: "We'll get this fixed as soon as possible.", replace: "We&apos;ll get this fixed as soon as possible." },
      { search: "Let's get you back on track.", replace: "Let&apos;s get you back on track." }
    ]
  },
  {
    file: 'src/app/login/page.tsx',
    fixes: [
      { search: "Don't have an account?", replace: "Don&apos;t have an account?" },
      { search: "We'll send you a magic link to sign in.", replace: "We&apos;ll send you a magic link to sign in." }
    ]
  },
  {
    file: 'src/app/logout/page.tsx',
    fixes: [
      { search: "You've been logged out successfully.", replace: "You&apos;ve been logged out successfully." }
    ]
  },
  {
    file: 'src/app/not-found.tsx',
    fixes: [
      { search: "We couldn't find the page you're looking for.", replace: "We couldn&apos;t find the page you&apos;re looking for." },
      { search: "Don't worry, even the Robot Overlord gets lost sometimes.", replace: "Don&apos;t worry, even the Robot Overlord gets lost sometimes." },
      { search: "Let's get you back to safety.", replace: "Let&apos;s get you back to safety." }
    ]
  },
  {
    file: 'src/app/notifications/page.tsx',
    fixes: [
      { search: "You're all caught up! No new notifications.", replace: "You&apos;re all caught up! No new notifications." }
    ]
  },
  {
    file: 'src/app/users/[userId]/edit/page.tsx',
    fixes: [
      { search: "Let's update your profile information.", replace: "Let&apos;s update your profile information." }
    ]
  },
  {
    file: 'src/app/users/[userId]/page.tsx',
    fixes: [
      { search: "This user hasn't posted anything yet.", replace: "This user hasn&apos;t posted anything yet." },
      { search: "They're probably planning something big!", replace: "They&apos;re probably planning something big!" }
    ]
  },
  {
    file: 'src/components/ErrorBoundary.tsx',
    fixes: [
      { search: "We're sorry, something went wrong.", replace: "We&apos;re sorry, something went wrong." }
    ]
  },
  {
    file: 'src/components/feed/ContentFeed.tsx',
    fixes: [
      { search: "You're all caught up!", replace: "You&apos;re all caught up!" }
    ]
  }
];

// Files with prefer-const errors
const preferConstFixes = [
  {
    file: 'src/app/moderation/posts/page.tsx',
    fixes: [
      { search: 'let endPage = Math.min(startPage + itemsPerPage - 1, totalItems);', replace: 'const endPage = Math.min(startPage + itemsPerPage - 1, totalItems);' }
    ]
  },
  {
    file: 'src/app/moderation/topics/page.tsx',
    fixes: [
      { search: 'let endPage = Math.min(startPage + itemsPerPage - 1, totalItems);', replace: 'const endPage = Math.min(startPage + itemsPerPage - 1, totalItems);' }
    ]
  },
  {
    file: 'src/app/posts/search/page.tsx',
    fixes: [
      { search: 'let endPage = Math.min(startPage + itemsPerPage - 1, totalItems);', replace: 'const endPage = Math.min(startPage + itemsPerPage - 1, totalItems);' }
    ]
  }
];

// Fix no-explicit-any error in search page
const anyTypeFixes = [
  {
    file: 'src/app/search/page.tsx',
    fixes: [
      { search: 'const searchParams = useSearchParams() as any;', replace: 'const searchParams = useSearchParams();' }
    ]
  }
];

function applyFixes(fixes) {
  fixes.forEach(({ file, fixes: fileFixes }) => {
    const filePath = path.join(__dirname, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    fileFixes.forEach(({ search, replace }) => {
      if (content.includes(search)) {
        content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
        modified = true;
        console.log(`Fixed in ${file}: ${search} -> ${replace}`);
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${file}`);
    }
  });
}

console.log('Fixing react/no-unescaped-entities errors...');
applyFixes(reactEntityFixes);

console.log('\nFixing prefer-const errors...');
applyFixes(preferConstFixes);

console.log('\nFixing no-explicit-any errors...');
applyFixes(anyTypeFixes);

console.log('\nAll fixes applied!');
