/**
 * LearnCpp.com Full Content Extractor (Node.js)
 * Crawls and extracts all 350+ lessons, code examples, quizzes, solutions, and notes
 * into structured offline Markdown files and a consolidated JSON curriculum database.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Output directories
const OUTPUT_DIR = path.join(__dirname, '..', 'learncpp_offline');
const CURRICULUM_FILE = path.join(OUTPUT_DIR, 'curriculum.json');

// Configuration
const CONFIG = {
  baseUrl: 'https://www.learncpp.com/',
  requestDelayMs: 300,
  maxRetries: 3,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// Known Chapter Titles Mapping
const CHAPTER_TITLES = {
  '0': 'Introduction & Getting Started',
  '1': 'C++ Basics',
  '2': 'C++ Basics - Functions and Files',
  '3': 'Debugging C++ Programs',
  '4': 'Fundamental Data Types',
  '5': 'Constants and Strings',
  '6': 'Operators',
  '7': 'Scope, Duration, and Linkage',
  '8': 'Control Flow',
  '9': 'Error Detection and Handling',
  '10': 'Type Conversion, Type Aliases, and Type Deduction',
  '11': 'Function Overloading and Function Templates',
  '12': 'Compound Types - References and Pointers',
  '13': 'Compound Types - Enums and Structs',
  '14': 'Introduction to Classes',
  '15': 'More on Classes',
  '16': 'Dynamic Arrays - std::vector',
  '17': 'Fixed-size Arrays - std::array and C-style Arrays',
  '18': 'Iterators and Algorithms',
  '19': 'Dynamic Allocation and Pointers',
  '20': 'Functions - Advanced',
  '21': 'Operator Overloading',
  '22': 'Move Semantics and Smart Pointers',
  '23': 'Object Relationships',
  '24': 'Inheritance',
  '25': 'Virtual Functions and Polymorphism',
  '26': 'Templates and Classes',
  '27': 'Exceptions',
  '28': 'Input and Output (I/O)',
  'A': 'Appendix A - Miscellaneous Topics',
  'B': 'Appendix B - C++ Standards Updates',
  'C': 'Appendix C - Legacy Features',
  'D': 'Appendix D - Reference Sheets',
  'F': 'Appendix F - Fixed-Width Types',
  'M': 'Appendix M - Modules',
  'O': 'Appendix O - Bit Manipulation'
};

// Helper: HTTP GET with redirect support and retry
function fetchUrl(url, retries = CONFIG.maxRetries) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, {
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirectUrl = res.headers.location;
        if (!redirectUrl.startsWith('http')) {
          redirectUrl = new URL(redirectUrl, url).toString();
        }
        return fetchUrl(redirectUrl, retries).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        if (retries > 0) {
          setTimeout(() => {
            fetchUrl(url, retries - 1).then(resolve).catch(reject);
          }, 1000);
          return;
        }
        return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      if (retries > 0) {
        setTimeout(() => {
          fetchUrl(url, retries - 1).then(resolve).catch(reject);
        }, 1500);
      } else {
        reject(err);
      }
    });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function unescapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–');
}

// Convert HTML content into structured Markdown
function htmlToMarkdown(htmlContent, lessonUrl) {
  if (!htmlContent) return '';

  let md = htmlContent;

  // 1. Remove unwanted elements (scripts, styles, ads, comments, navigation widgets)
  md = md.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  md = md.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  md = md.replace(/<div\s+class=["'][^"']*adsbygoogle[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');
  md = md.replace(/<!--[\s\S]*?-->/g, '');
  md = md.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  md = md.replace(/<div\s+class=["'][^"']*comment-navigation[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, '');

  // 2. Format Solutions & Quiz toggles
  md = md.replace(/<div[^>]*class=["'][^"']*solution_content[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, (match, inner) => {
    return `\n\n> 💡 **Solution:**\n> ${inner.trim().replace(/\n/g, '\n> ')}\n\n`;
  });

  // 3. Format Code Blocks
  md = md.replace(/<pre[^>]*><code[^>]*class=["'][^"']*language-([a-z0-9+#]+)[^"']*["'][^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, lang, code) => {
    const unescaped = unescapeHtml(code);
    return `\n\n\`\`\`${lang}\n${unescaped.trim()}\n\`\`\`\n\n`;
  });
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
    const unescaped = unescapeHtml(code);
    return `\n\n\`\`\`cpp\n${unescaped.trim()}\n\`\`\`\n\n`;
  });
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, (match, code) => {
    const unescaped = unescapeHtml(code.replace(/<[^>]+>/g, ''));
    return `\n\n\`\`\`cpp\n${unescaped.trim()}\n\`\`\`\n\n`;
  });

  // 4. Format Inline Code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (match, code) => {
    return `\`${unescapeHtml(code.replace(/<[^>]+>/g, '')).trim()}\``;
  });

  // 5. Format Note / Warning / Tip / Best Practice boxes
  md = md.replace(/<div[^>]*class=["'][^"']*(?:cpp-note|cpp-warn|cpp-tip|cpp-best-practice)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi, (match, text) => {
    const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return `\n\n> 📌 **Note:** ${cleanText}\n\n`;
  });

  // 6. Format Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n\n##### $1\n\n');

  // 7. Format Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n- $1');
  md = md.replace(/<\/?(?:ul|ol)[^>]*>/gi, '\n');

  // 8. Format Strong & Em
  md = md.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  md = md.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');

  // 9. Format Links
  md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // 10. Format Paragraphs & Linebreaks
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');

  // 11. Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // 12. Unescape special entities
  md = unescapeHtml(md);

  // 13. Clean up multiple newlines & whitespace
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '_').trim();
}

// Step 1: Discover all lesson URLs from the homepage TOC
async function fetchAllLessonUrls() {
  console.log('🔍 Fetching Table of Contents from LearnCpp.com...');
  const html = await fetchUrl(CONFIG.baseUrl);

  const lessonUrls = [];
  const seenUrls = new Set();
  const regex = /<a\s+[^>]*href=(?:["']([^"']+)["']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    let url = (match[1] || match[2] || '').trim();
    const rawTitle = unescapeHtml((match[3] || '').replace(/<[^>]+>/g, '').trim());

    if (url.startsWith('/')) {
      url = 'https://www.learncpp.com' + url;
    }

    if (url.includes('/cpp-tutorial/') && !url.includes('#') && !seenUrls.has(url)) {
      seenUrls.add(url);
      lessonUrls.push({
        url,
        rawTitle,
        slug: url.replace(/\/$/, '').split('/').pop()
      });
    }
  }

  console.log(`✅ Discovered ${lessonUrls.length} unique tutorial lessons on LearnCpp.com!\n`);
  return lessonUrls;
}

// Step 2: Extract a single lesson
async function extractLesson(lessonMeta) {
  const html = await fetchUrl(lessonMeta.url);

  // Extract title from <h1 class="entry-title">
  const titleMatch = html.match(/<h1[^>]*class=["'][^"']*entry-title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i) ||
                     html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const fullTitle = titleMatch ? unescapeHtml(titleMatch[1].replace(/<[^>]+>/g, '').trim()) : lessonMeta.rawTitle;

  // Extract lesson number e.g. "0.3", "1.1", "14.5", "M.1", "O.2", "21.x"
  const numMatch = fullTitle.match(/^([0-9A-Za-z]+(?:\.[0-9A-Za-z]+)?)\s*[-—–]\s*(.*)$/);
  let lessonNumber = '';
  let lessonTitle = fullTitle;

  if (numMatch) {
    lessonNumber = numMatch[1];
    lessonTitle = numMatch[2].trim();
  }

  // Determine chapter prefix
  const chapterPrefixMatch = lessonNumber.match(/^([0-9A-Za-z]+)/);
  const chapterPrefix = chapterPrefixMatch ? chapterPrefixMatch[1] : '0';
  const chapterTitle = CHAPTER_TITLES[chapterPrefix] || `Chapter ${chapterPrefix}`;

  // Extract article body
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const rawBody = articleMatch ? articleMatch[1] : html;

  // Convert to Markdown
  const markdownBody = htmlToMarkdown(rawBody, lessonMeta.url);

  const markdownContent = `---
title: "${fullTitle}"
lessonNumber: "${lessonNumber}"
chapter: "${chapterPrefix}"
chapterTitle: "${chapterTitle}"
url: "${lessonMeta.url}"
source: "LearnCpp.com"
extractedAt: "${new Date().toISOString()}"
---

# ${fullTitle}

${markdownBody}

---
*Source: [LearnCpp.com](${lessonMeta.url})*
`;

  return {
    url: lessonMeta.url,
    slug: lessonMeta.slug,
    fullTitle,
    lessonNumber,
    lessonTitle,
    chapterPrefix,
    chapterTitle,
    markdown: markdownContent,
    charCount: markdownBody.length
  };
}

// Step 3: Main execution runner
async function main() {
  const args = process.argv.slice(2);
  const limitArgIdx = args.indexOf('--limit');
  const limit = limitArgIdx !== -1 ? parseInt(args[limitArgIdx + 1], 10) : Infinity;

  const chapterArgIdx = args.indexOf('--chapter');
  const targetChapter = chapterArgIdx !== -1 ? args[chapterArgIdx + 1] : null;

  console.log('====================================================');
  console.log('🚀 LearnCpp.com Comprehensive Content Extractor');
  console.log('====================================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Fetch TOC
  const allLessons = await fetchAllLessonUrls();
  const curriculum = [];
  let totalSaved = 0;
  let totalProcessed = 0;
  const startTime = Date.now();

  for (let i = 0; i < allLessons.length; i++) {
    if (totalProcessed >= limit) {
      console.log(`\n🛑 Reached limit of ${limit} lessons. Stopping.`);
      break;
    }

    const item = allLessons[i];

    try {
      process.stdout.write(`⬇️  [${i + 1}/${allLessons.length}] Fetching: ${item.slug}... `);
      const lesson = await extractLesson(item);

      if (targetChapter && lesson.chapterPrefix !== targetChapter) {
        console.log(`⏭️ Skipped (target chapter is ${targetChapter})`);
        continue;
      }

      // Determine folder
      const paddedPrefix = isNaN(Number(lesson.chapterPrefix)) ? lesson.chapterPrefix : lesson.chapterPrefix.padStart(2, '0');
      const folderName = sanitizeFilename(`Chapter_${paddedPrefix}_${lesson.chapterTitle}`);
      const chapterDir = path.join(OUTPUT_DIR, folderName);

      if (!fs.existsSync(chapterDir)) {
        fs.mkdirSync(chapterDir, { recursive: true });
      }

      const filename = sanitizeFilename(`${lesson.lessonNumber || i + 1}_${lesson.lessonTitle || lesson.slug}`) + '.md';
      const filePath = path.join(chapterDir, filename);

      fs.writeFileSync(filePath, lesson.markdown, 'utf8');
      console.log(`✅ Saved ${lesson.lessonNumber || ''} -> ${filename} (${(lesson.markdown.length / 1024).toFixed(1)} KB)`);

      curriculum.push({
        lessonNumber: lesson.lessonNumber,
        title: lesson.lessonTitle,
        fullTitle: lesson.fullTitle,
        chapter: lesson.chapterPrefix,
        chapterTitle: lesson.chapterTitle,
        url: lesson.url,
        slug: lesson.slug,
        filePath: path.relative(OUTPUT_DIR, filePath)
      });

      totalSaved++;
      totalProcessed++;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      totalProcessed++;
    }

    await sleep(CONFIG.requestDelayMs);
  }

  // Save curriculum index
  fs.writeFileSync(CURRICULUM_FILE, JSON.stringify(curriculum, null, 2), 'utf8');

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log('\n====================================================');
  console.log(`🎉 Extraction Finished!`);
  console.log(`   Total Processed: ${totalProcessed}`);
  console.log(`   Saved Files: ${totalSaved}`);
  console.log(`   Curriculum Index: ${CURRICULUM_FILE}`);
  console.log(`   Output Folder: ${OUTPUT_DIR}`);
  console.log(`   Time Taken: ${durationSec}s`);
  console.log('====================================================\n');
}

main().catch(console.error);
