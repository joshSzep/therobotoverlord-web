#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common any -> unknown replacements
const replacements = [
  // Basic any types
  { from: ': any', to: ': unknown' },
  { from: ': any;', to: ': unknown;' },
  { from: ': any,', to: ': unknown,' },
  { from: ': any)', to: ': unknown)' },
  { from: ': any[]', to: ': unknown[]' },
  { from: ': any =', to: ': unknown =' },
  
  // Generic any types
  { from: '<any>', to: '<unknown>' },
  { from: 'Record<string, any>', to: 'Record<string, unknown>' },
  { from: '(...args: any[])', to: '(...args: unknown[])' },
  
  // Function parameters
  { from: '(data: any)', to: '(data: unknown)' },
  { from: '(value: any)', to: '(value: unknown)' },
  { from: '(props: any)', to: '(props: unknown)' },
  { from: '(config: any)', to: '(config: unknown)' },
  { from: '(options: any)', to: '(options: unknown)' },
  { from: '(context: any)', to: '(context: unknown)' },
  { from: '(error: any)', to: '(error: unknown)' },
  
  // Common patterns
  { from: 'as any', to: 'as unknown' },
  { from: '= any', to: '= unknown' },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const { from, to } of replacements) {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function findTypeScriptFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        traverse(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Fix all TypeScript files in src directory
const srcDir = path.join(__dirname, 'src');
const files = findTypeScriptFiles(srcDir);

console.log(`Found ${files.length} TypeScript files to check...`);

for (const file of files) {
  fixFile(file);
}

console.log('ESLint fixes completed!');
