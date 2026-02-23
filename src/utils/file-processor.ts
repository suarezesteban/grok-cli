import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Interface to track processed files to avoid duplicates and potentially circular references
 */
interface ProcessingState {
  processedFiles: Set<string>;
  projectRoot: string;
}

/**
 * Scans for @path/to/file patterns in the message and expands them with file content.
 * 
 * @param message - The user message possibly containing @file references
 * @param cwd - The base directory to resolve relative paths
 * @returns The expanded message with file contents wrapped in blocks
 */
export async function expandFilePaths(message: string, cwd: string = process.cwd()): Promise<string> {
  const state: ProcessingState = {
    processedFiles: new Set(),
    projectRoot: cwd,
  };

  const imports = findFileReferences(message);
  if (imports.length === 0) return message;

  let result = '';
  let lastIndex = 0;

  // Sort imports by start position to process them in order
  imports.sort((a, b) => a.start - b.start);

  for (const { start, end, rawPath } of imports) {
    // Add text before the reference
    result += message.substring(lastIndex, start);
    lastIndex = end;

    const fullPath = path.resolve(cwd, rawPath);
    
    // Safety check: ensure file is within current project or at least doesn't traverse upwards too far
    // For now, we allow any file relative to cwd, but we'll track unique files
    if (state.processedFiles.has(fullPath)) {
      result += `<!-- File already included: ${rawPath} -->`;
      continue;
    }

    try {
      const stats = await fs.stat(fullPath);
      if (stats.isFile()) {
        const content = await fs.readFile(fullPath, 'utf-8');
        state.processedFiles.add(fullPath);
        
        result += `\n--- File: ${rawPath} ---\n${content.trim()}\n--- End of File: ${rawPath} ---\n`;
      } else {
         result += `<!-- Skipping ${rawPath}: Not a file -->`;
      }
    } catch (error: any) {
      result += `<!-- Failed to read ${rawPath}: ${error.message} -->`;
    }
  }

  // Add remaining text
  result += message.substring(lastIndex);

  return result;
}

/**
 * Finds all @path-like references in the text.
 * Logic matches gemini-cli: looks for @ followed by characters until whitespace/newline.
 */
function findFileReferences(content: string): Array<{ start: number; end: number; rawPath: string }> {
  const references: Array<{ start: number; end: number; rawPath: string }> = [];
  let i = 0;
  const len = content.length;

  while (i < len) {
    // Find next @ symbol
    i = content.indexOf('@', i);
    if (i === -1) break;

    // Check if it's a word boundary (prevents matching emails or decorated text)
    if (i > 0 && !isWhitespace(content[i - 1])) {
      i++;
      continue;
    }

    // Find the end of the path (whitespace, newline, or typical punctuation at end of sentence)
    let j = i + 1;
    while (
      j < len &&
      !isWhitespace(content[j]) &&
      !isEndDelimiter(content[j])
    ) {
      j++;
    }

    const rawPath = content.slice(i + 1, j);

    // Basic validation: must start with something path-like
    if (
      rawPath.length > 0 &&
      (rawPath[0] === '.' || rawPath[0] === '/' || isLetter(rawPath[0]))
    ) {
      references.push({
        start: i,
        end: j,
        rawPath,
      });
    }

    i = j;
  }

  return references;
}

function isWhitespace(char: string): boolean {
  return char === ' ' || char === '\t' || char === '\n' || char === '\r';
}

function isEndDelimiter(char: string): boolean {
  // Stop at common ending punctuation that isn't usually part of a filename
  return [',', ';', ')', ']', '}', '"', "'", '>'].includes(char);
}

function isLetter(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 65 && code <= 90) || // A-Z
    (code >= 97 && code <= 122) || // a-z
    code > 127 // Allow non-ASCII (e.g. Japanese filenames)
  );
}
