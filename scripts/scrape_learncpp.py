#!/usr/bin/env python3
"""
LearnCpp.com Comprehensive Content Extractor (Python 3)
Crawls and extracts all 350+ lessons, code examples, quizzes, solutions, and notes
into structured offline Markdown files and a consolidated JSON curriculum database.

Usage:
  python scripts/scrape_learncpp.py                 # Scrape all lessons
  python scripts/scrape_learncpp.py --limit 10       # Scrape first 10 lessons
  python scripts/scrape_learncpp.py --chapter 1      # Scrape chapter 1 only
"""

import os
import re
import sys
import json
import time
import urllib.request
import urllib.parse
from html import unescape
from pathlib import Path

# Fix Windows console encoding for Unicode/emojis
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "learncpp_offline"
CURRICULUM_FILE = OUTPUT_DIR / "curriculum.json"

BASE_URL = "https://www.learncpp.com/"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
REQUEST_DELAY_SEC = 0.35

CHAPTER_TITLES = {
    "0": "Introduction & Getting Started",
    "1": "C++ Basics",
    "2": "C++ Basics - Functions and Files",
    "3": "Debugging C++ Programs",
    "4": "Fundamental Data Types",
    "5": "Constants and Strings",
    "6": "Operators",
    "7": "Scope, Duration, and Linkage",
    "8": "Control Flow",
    "9": "Error Detection and Handling",
    "10": "Type Conversion, Type Aliases, and Type Deduction",
    "11": "Function Overloading and Function Templates",
    "12": "Compound Types - References and Pointers",
    "13": "Compound Types - Enums and Structs",
    "14": "Introduction to Classes",
    "15": "More on Classes",
    "16": "Dynamic Arrays - std::vector",
    "17": "Fixed-size Arrays - std::array and C-style Arrays",
    "18": "Iterators and Algorithms",
    "19": "Dynamic Allocation and Pointers",
    "20": "Functions - Advanced",
    "21": "Operator Overloading",
    "22": "Move Semantics and Smart Pointers",
    "23": "Object Relationships",
    "24": "Inheritance",
    "25": "Virtual Functions and Polymorphism",
    "26": "Templates and Classes",
    "27": "Exceptions",
    "28": "Input and Output (I/O)",
    "A": "Appendix A - Miscellaneous Topics",
    "B": "Appendix B - C++ Standards Updates",
    "C": "Appendix C - Legacy Features",
    "D": "Appendix D - Reference Sheets",
    "F": "Appendix F - Fixed-Width Types",
    "M": "Appendix M - Modules",
    "O": "Appendix O - Bit Manipulation"
}

def fetch_url(url, retries=3):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
    )
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                return response.read().decode("utf-8", errors="replace")
        except Exception as e:
            if attempt == retries - 1:
                raise e
            time.sleep(1.5 * (attempt + 1))

def sanitize_filename(name):
    clean = re.sub(r'[<>:"/\\|?*]', '', name)
    clean = re.sub(r'\s+', '_', clean).strip()
    return clean

def html_to_markdown(html_content, lesson_url=""):
    if not html_content:
        return ""

    md = html_content

    # 1. Strip scripts, styles, ads, comments
    md = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', md, flags=re.I)
    md = re.sub(r'<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>', '', md, flags=re.I)
    md = re.sub(r'<div\s+class=["\'][^"\']*adsbygoogle[^"\']*["\'][^>]*>[\s\S]*?<\/div>', '', md, flags=re.I)
    md = re.sub(r'<!--[\s\S]*?-->', '', md)
    md = re.sub(r'<nav[^>]*>[\s\S]*?<\/nav>', '', md, flags=re.I)

    # 2. Format Solutions
    def sub_solution(match):
        inner = match.group(1).strip()
        lines = inner.split('\n')
        quoted = '\n> '.join(lines)
        return f"\n\n> 💡 **Solution:**\n> {quoted}\n\n"
    md = re.sub(r'<div[^>]*class=["\'][^"\']*solution_content[^"\']*["\'][^>]*>([\s\S]*?)<\/div>', sub_solution, md, flags=re.I)

    # 3. Format Code Blocks
    def sub_code_lang(match):
        lang = match.group(1)
        code = unescape(match.group(2)).strip()
        return f"\n\n```{lang}\n{code}\n```\n\n"
    md = re.sub(r'<pre[^>]*><code[^>]*class=["\'][^"\']*language-([a-z0-9+#]+)[^"\']*["\'][^>]*>([\s\S]*?)<\/code><\/pre>', sub_code_lang, md, flags=re.I)

    def sub_code_plain(match):
        code = unescape(match.group(1)).strip()
        return f"\n\n```cpp\n{code}\n```\n\n"
    md = re.sub(r'<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>', sub_code_plain, md, flags=re.I)
    md = re.sub(r'<pre[^>]*>([\s\S]*?)<\/pre>', sub_code_plain, md, flags=re.I)

    # 4. Inline Code
    md = re.sub(r'<code[^>]*>([\s\S]*?)<\/code>', lambda m: f"`{unescape(re.sub(r'<[^>]+>', '', m.group(1))).strip()}`", md, flags=re.I)

    # 5. Note / Warning / Tip / Best Practice boxes
    def sub_note(match):
        text = re.sub(r'<[^>]+>', ' ', match.group(1))
        text = re.sub(r'\s+', ' ', text).strip()
        return f"\n\n> 📌 **Note:** {text}\n\n"
    md = re.sub(r'<div[^>]*class=["\'][^"\']*(?:cpp-note|cpp-warn|cpp-tip|cpp-best-practice)[^"\']*["\'][^>]*>([\s\S]*?)<\/div>', sub_note, md, flags=re.I)

    # 6. Headings
    md = re.sub(r'<h1[^>]*>([\s\S]*?)<\/h1>', r'\n\n# \1\n\n', md, flags=re.I)
    md = re.sub(r'<h2[^>]*>([\s\S]*?)<\/h2>', r'\n\n## \1\n\n', md, flags=re.I)
    md = re.sub(r'<h3[^>]*>([\s\S]*?)<\/h3>', r'\n\n### \1\n\n', md, flags=re.I)
    md = re.sub(r'<h4[^>]*>([\s\S]*?)<\/h4>', r'\n\n#### \1\n\n', md, flags=re.I)

    # 7. Lists
    md = re.sub(r'<li[^>]*>([\s\S]*?)<\/li>', r'\n- \1', md, flags=re.I)
    md = re.sub(r'<\/?(?:ul|ol)[^>]*>', '\n', md, flags=re.I)

    # 8. Strong & Em
    md = re.sub(r'<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>', r'**\1**', md, flags=re.I)
    md = re.sub(r'<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>', r'*\1*', md, flags=re.I)

    # 9. Links
    md = re.sub(r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)<\/a>', r'[\2](\1)', md, flags=re.I)

    # 10. Paragraphs & Linebreaks
    md = re.sub(r'<br\s*\/?>', '\n', md, flags=re.I)
    md = re.sub(r'<p[^>]*>([\s\S]*?)<\/p>', r'\n\n\1\n\n', md, flags=re.I)

    # 11. Strip remaining tags & unescape
    md = re.sub(r'<[^>]+>', '', md)
    md = unescape(md)

    # 12. Cleanup excess whitespace
    md = re.sub(r'\n{3,}', '\n\n', md).strip()
    return md

def main():
    import argparse
    parser = argparse.ArgumentParser(description="LearnCpp Full Content Extractor")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of lessons to extract")
    parser.add_argument("--chapter", type=str, default=None, help="Extract specific chapter e.g. '1', '14', 'M'")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("====================================================")
    print("🚀 LearnCpp.com Comprehensive Content Extractor (Python)")
    print("====================================================\n")

    print("🔍 Fetching Table of Contents from LearnCpp.com...")
    toc_html = fetch_url(BASE_URL)

    anchor_pattern = re.compile(r'<a\s+[^>]*href=(?:["\']([^"\']+)["\']|([^\s>]+))[^>]*>([\s\S]*?)<\/a>', re.I)
    seen_urls = set()
    lesson_items = []

    for match in anchor_pattern.finditer(toc_html):
        url = (match.group(1) or match.group(2) or "").strip()
        raw_title = unescape(re.sub(r'<[^>]+>', '', match.group(3) or "")).strip()

        if url.startswith('/'):
            url = "https://www.learncpp.com" + url

        if "/cpp-tutorial/" in url and "#" not in url and url not in seen_urls:
            seen_urls.add(url)
            slug = url.rstrip("/").split("/")[-1]
            lesson_items.append({"url": url, "rawTitle": raw_title, "slug": slug})

    print(f"✅ Discovered {len(lesson_items)} unique tutorial lessons on LearnCpp.com!\n")

    curriculum = []
    total_saved = 0
    total_processed = 0
    start_time = time.time()

    for idx, item in enumerate(lesson_items):
        if args.limit and total_processed >= args.limit:
            print(f"\n🛑 Reached limit of {args.limit} lessons. Stopping.")
            break

        try:
            print(f"⬇️  [{idx + 1}/{len(lesson_items)}] Fetching: {item['slug']}... ", end="", flush=True)
            lesson_html = fetch_url(item["url"])

            # Extract title from <h1>
            title_match = re.search(r'<h1[^>]*class=["\'][^"\']*entry-title[^"\']*["\'][^>]*>([\s\S]*?)<\/h1>', lesson_html, re.I)
            if not title_match:
                title_match = re.search(r'<h1[^>]*>([\s\S]*?)<\/h1>', lesson_html, re.I)

            full_title = unescape(re.sub(r'<[^>]+>', '', title_match.group(1))).strip() if title_match else item["rawTitle"]

            # Extract lesson number
            num_match = re.match(r'^([0-9A-Za-z]+(?:\.[0-9A-Za-z]+)?)\s*[-—–]\s*(.*)$', full_title)
            lesson_number = num_match.group(1) if num_match else ""
            lesson_title = num_match.group(2).strip() if num_match else full_title

            chapter_prefix_match = re.match(r'^([0-9A-Za-z]+)', lesson_number)
            chapter_prefix = chapter_prefix_match.group(1) if chapter_prefix_match else "0"
            chapter_title = CHAPTER_TITLES.get(chapter_prefix, f"Chapter {chapter_prefix}")

            if args.chapter and chapter_prefix.lower() != args.chapter.lower():
                print(f"⏭️ Skipped (target chapter is {args.chapter})")
                continue

            article_match = re.search(r'<article[^>]*>([\s\S]*?)<\/article>', lesson_html, re.I)
            raw_body = article_match.group(1) if article_match else lesson_html

            markdown_body = html_to_markdown(raw_body, item["url"])

            markdown_content = f"""---
title: "{full_title}"
lessonNumber: "{lesson_number}"
chapter: "{chapter_prefix}"
chapterTitle: "{chapter_title}"
url: "{item['url']}"
source: "LearnCpp.com"
extractedAt: "{time.strftime('%Y-%m-%dT%H:%M:%SZ')}"
---

# {full_title}

{markdown_body}

---
*Source: [LearnCpp.com]({item['url']})*
"""

            padded_prefix = chapter_prefix if not chapter_prefix.isdigit() else chapter_prefix.zfill(2)
            folder_name = sanitize_filename(f"Chapter_{padded_prefix}_{chapter_title}")
            chapter_dir = OUTPUT_DIR / folder_name
            chapter_dir.mkdir(parents=True, exist_ok=True)

            filename = sanitize_filename(f"{lesson_number or (idx + 1)}_{lesson_title}") + ".md"
            file_path = chapter_dir / filename

            with open(file_path, "w", encoding="utf-8") as f:
                f.write(markdown_content)

            kb = len(markdown_content.encode("utf-8")) / 1024
            print(f"✅ Saved {lesson_number} -> {filename} ({kb:.1f} KB)")

            curriculum.append({
                "lessonNumber": lesson_number,
                "title": lesson_title,
                "fullTitle": full_title,
                "chapter": chapter_prefix,
                "chapterTitle": chapter_title,
                "url": item["url"],
                "slug": item["slug"],
                "filePath": str(file_path.relative_to(OUTPUT_DIR))
            })

            total_saved += 1
            total_processed += 1
        except Exception as e:
            print(f"❌ Failed: {e}")
            total_processed += 1

        time.sleep(REQUEST_DELAY_SEC)

    with open(CURRICULUM_FILE, "w", encoding="utf-8") as f:
        json.dump(curriculum, f, indent=2)

    duration_sec = int(time.time() - start_time)
    print("\n====================================================")
    print("🎉 Extraction Finished!")
    print(f"   Total Processed: {total_processed}")
    print(f"   Saved Files: {total_saved}")
    print(f"   Curriculum Index: {CURRICULUM_FILE}")
    print(f"   Output Folder: {OUTPUT_DIR}")
    print(f"   Time Taken: {duration_sec}s")
    print("====================================================\n")

if __name__ == "__main__":
    main()
