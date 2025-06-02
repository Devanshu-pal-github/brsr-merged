import React from 'react';

// Helper to escape HTML characters - kept for safety on text nodes
const escapeHtml = (unsafe: string): string => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Helper to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
  if (typeof text !== 'string') return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const parseInlineMarkdown = (line: string): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  if (typeof line !== 'string' || !line) return elements;

  const tokenRegex = /(\*\*(?!\s)((?:[^*]|\*(?!\*))+?)(?!\s)\*\*|__(?!\s)((?:[^_]|_(?!_))+?)(?!\s)__|(?<!\w)\*((?:[^*])+?)\*(?!\w)(?!\*)|(?<![\w_])_((?:[^_])+?)_(?![\w_])|`((?:[^`])+?)`)/g;
  
  let remainingLine = line;
  let keyIndex = 0;
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(remainingLine)) !== null) {
    if (match.index > lastIndex) {
      elements.push(escapeHtml(remainingLine.substring(lastIndex, match.index)));
    }
    
    const boldTextAsterisk = match[2];
    const boldTextUnderscore = match[3];
    const italicTextAsterisk = match[4];
    const italicTextUnderscore = match[5];
    const codeText = match[6];

    if (boldTextAsterisk !== undefined) {
      elements.push(React.createElement("strong", { key: `strong-${keyIndex++}` }, ...parseInlineMarkdown(boldTextAsterisk)));
    } else if (boldTextUnderscore !== undefined) {
      elements.push(React.createElement("strong", { key: `strong-${keyIndex++}` }, ...parseInlineMarkdown(boldTextUnderscore)));
    } else if (italicTextAsterisk !== undefined) {
      elements.push(React.createElement("em", { key: `em-${keyIndex++}` }, ...parseInlineMarkdown(italicTextAsterisk)));
    } else if (italicTextUnderscore !== undefined) {
      elements.push(React.createElement("em", { key: `em-${keyIndex++}` }, ...parseInlineMarkdown(italicTextUnderscore)));
    } else if (codeText !== undefined) {
      elements.push(React.createElement("code", { key: `code-${keyIndex++}`, className: "bg-slate-200 dark:bg-slate-600/50 px-1.5 py-0.5 rounded text-xs font-mono text-blue-700 dark:text-blue-300" }, escapeHtml(codeText)));
    } else {
       elements.push(escapeHtml(match[0])); 
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < remainingLine.length) {
    elements.push(escapeHtml(remainingLine.substring(lastIndex)));
  }
  
  return elements.length > 0 ? elements : (line ? [escapeHtml(line)] : []); 
};


export const renderMarkdown = (text: string): React.ReactNode => {
  if (text === null || text === undefined || typeof text !== 'string' || text.trim() === '') return null;

  const decodedText = decodeHtmlEntities(text);

  const blocks = decodedText.split(/(\n```(?:[\w-]*)\n[\s\S]*?\n```|\n`{3,}(?:[\w-]*)\n[\s\S]*?\n`{3,})/g);
  const elements: React.ReactNode[] = [];
  let keyCounter = 0;
  
  let currentListType: 'ul' | 'ol' | null = null;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0 && currentListType) {
      const listKey = `${currentListType}-${keyCounter++}`;
      const listClasses = "list-inside pl-5 my-1.5 space-y-0.5 text-slate-700 dark:text-slate-200"; 
      if (currentListType === 'ul') {
        elements.push(React.createElement("ul", { key: listKey, className: `list-disc ${listClasses}` }, ...listItems));
      } else if (currentListType === 'ol') {
        elements.push(React.createElement("ol", { key: listKey, className: `list-decimal ${listClasses}` }, ...listItems));
      }
    }
    listItems = [];
    currentListType = null;
  };

  let paragraphBuffer: React.ReactNode[] = [];
  
  blocks.forEach((block, blockIndex) => {
    if (!block || block.trim() === '') return;

    const flushParagraph = () => {
      if (paragraphBuffer.length > 0) {
        elements.push(
          React.createElement("p", {
            key: `p-${keyCounter++}-${blockIndex}`,
            className: "my-1.5 leading-relaxed text-slate-700 dark:text-slate-200"
          }, ...paragraphBuffer)
        );
        paragraphBuffer = [];
      }
    };

    const codeBlockMatch = block.match(/^\n```([\w-]*)\n([\s\S]*?)\n```$/m) || block.match(/^\n`{3,}([\w-]*)\n([\s\S]*?)\n`{3,}$/m);
    if (codeBlockMatch) {
      flushList();
      flushParagraph();
      const language = escapeHtml(codeBlockMatch[1] || 'plaintext');
      const code = codeBlockMatch[2] || ''; 
      elements.push(
        React.createElement("pre", {
          key: `pre-${keyCounter++}-${blockIndex}`,
          className: "bg-slate-200 dark:bg-slate-600/50 p-3 my-2 rounded-lg overflow-x-auto text-xs font-mono shadow text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600"
        }, 
          React.createElement("code", { className: `language-${language}` }, escapeHtml(code))
        )
      );
      return;
    }

    const lines = block.split('\n');

    lines.forEach((originalLine, lineIndex) => {
      const trimmedLine = originalLine.trim(); 

      if (trimmedLine === '') { 
        flushList();
        flushParagraph(); // Flush current paragraph if any, before starting a new one implicitly or explicitly
        return;
      }

      let ulMatch, olMatch; 
      ulMatch = originalLine.match(/^(\s*)(?:[-*+])\s+(.*)/);
      olMatch = originalLine.match(/^(\s*)(\d+)\.\s+(.*)/);

      if (trimmedLine.startsWith('###### ')) {
        flushList(); flushParagraph();
        elements.push(React.createElement("h6", { key: `h6-${keyCounter++}`, className: "text-sm font-semibold my-1 text-slate-800 dark:text-slate-100" }, ...parseInlineMarkdown(trimmedLine.substring(7))));
      } else if (trimmedLine.startsWith('##### ')) {
        flushList(); flushParagraph();
        elements.push(React.createElement("h5", { key: `h5-${keyCounter++}`, className: "text-md font-semibold my-1 text-slate-800 dark:text-slate-100" }, ...parseInlineMarkdown(trimmedLine.substring(6))));
      } else if (trimmedLine.startsWith('#### ')) {
        flushList(); flushParagraph();
        elements.push(React.createElement("h4", { key: `h4-${keyCounter++}`, className: "text-lg font-semibold my-1.5 text-slate-800 dark:text-slate-100" }, ...parseInlineMarkdown(trimmedLine.substring(5))));
      } else if (trimmedLine.startsWith('### ')) {
        flushList(); flushParagraph();
        elements.push(React.createElement("h3", { key: `h3-${keyCounter++}`, className: "text-xl font-semibold my-2 text-slate-800 dark:text-slate-100" }, ...parseInlineMarkdown(trimmedLine.substring(4))));
      } else if (trimmedLine.startsWith('## ')) {
        flushList(); flushParagraph();
        elements.push(React.createElement("h2", { key: `h2-${keyCounter++}`, className: "text-2xl font-semibold my-2.5 pb-1 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" }, ...parseInlineMarkdown(trimmedLine.substring(3))));
      } else if (trimmedLine.startsWith('# ')) {
        flushList(); flushParagraph();
        elements.push(React.createElement("h1", { key: `h1-${keyCounter++}`, className: "text-3xl font-semibold my-3 pb-1.5 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100" }, ...parseInlineMarkdown(trimmedLine.substring(2))));
      }
      else if (ulMatch) {
        flushParagraph(); 
        if (currentListType !== 'ul') {
          flushList(); 
          currentListType = 'ul';
        }
        const listItemContent = ulMatch[2]?.trim(); 
        if (listItemContent) { 
          listItems.push(React.createElement("li", { key: `li-ul-${keyCounter++}-${lineIndex}` }, ...parseInlineMarkdown(listItemContent)));
        }
      } else if (olMatch) {
        flushParagraph();
        if (currentListType !== 'ol') {
          flushList();
          currentListType = 'ol';
        }
        const listItemContent = olMatch[3]?.trim(); 
        if (listItemContent) { 
          listItems.push(React.createElement("li", { key: `li-ol-${keyCounter++}-${lineIndex}` }, ...parseInlineMarkdown(listItemContent)));
        }
      } else { // Paragraph line
        flushList(); 
        if (paragraphBuffer.length > 0) { // If it's not the first line of this paragraph buffer
            paragraphBuffer.push(React.createElement("br", { key: `br-para-${keyCounter++}` }));
        }
        paragraphBuffer.push(...parseInlineMarkdown(originalLine));
      }
    });
    flushParagraph(); // Flush any remaining paragraph content at the end of a block
  });

  flushList(); // Flush any remaining list at the very end

  const filteredElements = elements.filter(el => el !== null && (typeof el !== 'string' || (el as string).trim() !== ''));
  return React.createElement(React.Fragment, null, ...filteredElements);
};
