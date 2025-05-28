#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the generated react-query file
const filePath = path.join(__dirname, '../src/generated/react-query.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic import
content = content.replace(
  'import { RequestInit } from "graphql-request/dist/types.dom";',
  '// RequestInit type is defined inline\ntype RequestInit = { headers?: Record<string, string> };'
);

// Remove Types. prefix - the types are defined in the same file
content = content.replace(/Types\./g, '');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed RequestInit import and Types references in react-query.ts');