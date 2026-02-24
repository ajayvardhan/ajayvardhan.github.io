#!/usr/bin/env node
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const OBSIDIAN_BLOG_DIR = '/Users/ajay/Desktop/Personal/Blog/Blog Posts';
const VAULT_NAME = 'Blog';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(resolve => rl.question(q, resolve));

function toSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const title = await ask('Title: ');
if (!title.trim()) { console.error('Title is required.'); process.exit(1); }

const description = await ask('Description: ');

console.log('Category: general / poem / short-story / nostalgia');
const category = (await ask('Category [general]: ')).trim() || 'general';

console.log('Language: en / ta');
const lang = (await ask('Language [en]: ')).trim() || 'en';

const tagsInput = await ask('Tags (comma-separated, optional): ');
const tags = tagsInput.trim()
  ? tagsInput.split(',').map(t => `"${t.trim()}"`).join(', ')
  : '';

rl.close();

const slug = toSlug(title);
const today = new Date().toISOString().split('T')[0];

const content = `---
title: "${title}"
description: "${description}"
pubDate: ${today}
category: ${category}
lang: ${lang}
tags: [${tags}]
draft: true
---

`;

const filePath = path.join(OBSIDIAN_BLOG_DIR, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`\nA post with slug "${slug}" already exists: ${filePath}`);
  process.exit(1);
}

fs.writeFileSync(filePath, content);
console.log(`\nCreated: ${filePath}`);

// Open in Obsidian
const fileParam = encodeURIComponent(`Blog Posts/${slug}`);
const obsidianUrl = `obsidian://open?vault=${encodeURIComponent(VAULT_NAME)}&file=${fileParam}`;
execSync(`open "${obsidianUrl}"`);
console.log('Opening in Obsidian... (set draft: false when ready to publish)');
