#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Quote and apostrophe replacements for React
const replacements = [
  // Apostrophes in text content
  { from: /Don't/g, to: "Don&apos;t" },
  { from: /won't/g, to: "won&apos;t" },
  { from: /can't/g, to: "can&apos;t" },
  { from: /isn't/g, to: "isn&apos;t" },
  { from: /doesn't/g, to: "doesn&apos;t" },
  { from: /haven't/g, to: "haven&apos;t" },
  { from: /shouldn't/g, to: "shouldn&apos;t" },
  { from: /wouldn't/g, to: "wouldn&apos;t" },
  { from: /couldn't/g, to: "couldn&apos;t" },
  { from: /didn't/g, to: "didn&apos;t" },
  { from: /wasn't/g, to: "wasn&apos;t" },
  { from: /weren't/g, to: "weren&apos;t" },
  { from: /I'm/g, to: "I&apos;m" },
  { from: /you're/g, to: "you&apos;re" },
  { from: /we're/g, to: "we&apos;re" },
  { from: /they're/g, to: "they&apos;re" },
  { from: /it's/g, to: "it&apos;s" },
  { from: /that's/g, to: "that&apos;s" },
  { from: /what's/g, to: "what&apos;s" },
  { from: /here's/g, to: "here&apos;s" },
  { from: /there's/g, to: "there&apos;s" },
  { from: /let's/g, to: "let&apos;s" },
  
  // Quotes in JSX text content (not in attributes)
  { from: />([^<]*)"([^<]*)</g, to: '>$1&quot;$2<' },
  { from: />([^<]*)"([^<]*)"([^<]*)</g, to: '>$1&quot;$2&quot;$3<' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const { from, to } of replacements) {
      const originalContent = content;
      content = content.replace(from, to);
      if (content !== originalContent) {
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed quotes in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function findReactFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Fix all React component files in src directory
const srcDir = path.join(__dirname, 'src');
const files = findReactFiles(srcDir);

console.log(`Found ${files.length} React component files to check...`);

for (const file of files) {
  fixFile(file);
}

console.log('Quote escaping fixes completed!');
