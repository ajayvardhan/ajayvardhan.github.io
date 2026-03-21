#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const OBSIDIAN_BLOG_DIR = '/Users/ajay/Desktop/Personal/Blog/Blog Posts';
const BLOG_SRC_DIR = path.resolve(import.meta.dirname, '../src/content/blog');

// If a specific file is passed (triggered from the in-post button),
// mark it as published before syncing.
const activeFile = process.argv[2];
if (activeFile && fs.existsSync(activeFile)) {
  const content = fs.readFileSync(activeFile, 'utf-8');
  if (content.includes('draft: true')) {
    fs.writeFileSync(activeFile, content.replace(/^draft:\s*true/m, 'draft: false'));
    console.log(`Published: ${path.basename(activeFile)}`);
  }
}

const obsidianFiles = fs.readdirSync(OBSIDIAN_BLOG_DIR).filter(f => f.endsWith('.md'));
const publishedFiles = fs.readdirSync(BLOG_SRC_DIR).filter(f => f.endsWith('.md'));

// Delete files that were removed/renamed in Obsidian
for (const file of publishedFiles) {
  if (!obsidianFiles.includes(file)) {
    fs.unlinkSync(path.join(BLOG_SRC_DIR, file));
    console.log(`Removed: ${file}`);
  }
}

// Copy/update files from Obsidian
for (const file of obsidianFiles) {
  fs.copyFileSync(path.join(OBSIDIAN_BLOG_DIR, file), path.join(BLOG_SRC_DIR, file));
}
console.log(`Synced ${obsidianFiles.length} post(s) from Obsidian → src/content/blog/`);

const status = execSync('git status --porcelain src/content/blog/').toString().trim();
if (!status) {
  console.log('No changes to publish.');
  process.exit(0);
}

const date = new Date().toISOString().split('T')[0];
execSync('git add src/content/blog/', { stdio: 'inherit' });
execSync(`git commit -m "Publish blog posts (${date})"`, { stdio: 'inherit' });
execSync('git push', { stdio: 'inherit' });
console.log('\nDone! GitHub Actions will deploy your changes shortly.');
