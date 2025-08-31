#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Specific replacements for React no-unescaped-entities
const replacements = [
  // Common contractions
  { from: /(\s|>)Don't(\s|<)/g, to: "$1Don&apos;t$2" },
  { from: /(\s|>)won't(\s|<)/g, to: "$1won&apos;t$2" },
  { from: /(\s|>)can't(\s|<)/g, to: "$1can&apos;t$2" },
  { from: /(\s|>)isn't(\s|<)/g, to: "$1isn&apos;t$2" },
  { from: /(\s|>)doesn't(\s|<)/g, to: "$1doesn&apos;t$2" },
  { from: /(\s|>)haven't(\s|<)/g, to: "$1haven&apos;t$2" },
  { from: /(\s|>)shouldn't(\s|<)/g, to: "$1shouldn&apos;t$2" },
  { from: /(\s|>)wouldn't(\s|<)/g, to: "$1wouldn&apos;t$2" },
  { from: /(\s|>)couldn't(\s|<)/g, to: "$1couldn&apos;t$2" },
  { from: /(\s|>)didn't(\s|<)/g, to: "$1didn&apos;t$2" },
  { from: /(\s|>)wasn't(\s|<)/g, to: "$1wasn&apos;t$2" },
  { from: /(\s|>)weren't(\s|<)/g, to: "$1weren&apos;t$2" },
  { from: /(\s|>)I'm(\s|<)/g, to: "$1I&apos;m$2" },
  { from: /(\s|>)you're(\s|<)/g, to: "$1you&apos;re$2" },
  { from: /(\s|>)we're(\s|<)/g, to: "$1we&apos;re$2" },
  { from: /(\s|>)they're(\s|<)/g, to: "$1they&apos;re$2" },
  { from: /(\s|>)it's(\s|<)/g, to: "$1it&apos;s$2" },
  { from: /(\s|>)that's(\s|<)/g, to: "$1that&apos;s$2" },
  { from: /(\s|>)what's(\s|<)/g, to: "$1what&apos;s$2" },
  { from: /(\s|>)here's(\s|<)/g, to: "$1here&apos;s$2" },
  { from: /(\s|>)there's(\s|<)/g, to: "$1there&apos;s$2" },
  { from: /(\s|>)let's(\s|<)/g, to: "$1let&apos;s$2" },
  { from: /(\s|>)We're(\s|<)/g, to: "$1We&apos;re$2" },
  
  // Quotes in JSX content (not in attributes or strings)
  { from: /(\s|>)"([^"<>]*)"(\s|<)/g, to: "$1&quot;$2&quot;$3" },
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
      console.log(`Fixed entities in: ${filePath}`);
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

console.log('Entity escaping fixes completed!');
