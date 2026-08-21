# LearnCpp.com Full Content Extractor

Automated extractors to crawl and save all 350+ tutorial lessons, full source code snippets, diagrams, quizzes, and solutions from [LearnCpp.com](https://www.learncpp.com/) into structured offline Markdown files and JSON metadata.

---

## Output Structure

All extracted content is saved to `d:\DSA-Tracker\learncpp_offline\`:
```
learncpp_offline/
├── curriculum.json                                    # Master index of all 356 lessons
├── Chapter_00_Introduction_&_Getting_Started/
│   ├── 0.1_Introduction_to_these_tutorials.md
│   ├── 0.2_Introduction_to_programs_and_programming_languages.md
│   └── 0.3_Introduction_to_CC++.md ...
├── Chapter_01_C++_Basics/
│   ├── 1.1_Statements_and_the_structure_of_a_program.md
│   ├── 1.2_Comments.md ...
├── Chapter_02_C++_Basics_-_Functions_and_Files/
├── ...
└── Appendix_M_Appendix_M_-_Modules/
```

Each Markdown file includes:
- YAML Frontmatter metadata (Title, Lesson number, Chapter, URL, Date extracted)
- Clean article text stripped of ads and navigation
- Formatted ````cpp```` code blocks with syntax highlighting
- Formatted Callout / Best Practice / Note blockquotes
- Formatted Quizzes and toggleable solutions

---

## How to Run

### Option 1: Node.js (Recommended)
```bash
# Scrape all 356 lessons:
node scripts/scrape-learncpp.js

# Scrape first 10 lessons (testing):
node scripts/scrape-learncpp.js --limit 10

# Scrape a specific chapter (e.g. Chapter 1 or Chapter 14):
node scripts/scrape-learncpp.js --chapter 1
```

### Option 2: Python 3
```bash
# Scrape all 356 lessons:
python scripts/scrape_learncpp.py

# Scrape with limit:
python scripts/scrape_learncpp.py --limit 10

# Scrape specific chapter:
python scripts/scrape_learncpp.py --chapter 1
```

---

## Features
- **Auto-Discovery**: Crawls the live Table of Contents across Chapters 0–28 and Appendices A–O.
- **Resume Support**: Skips already-downloaded files if the process is paused or restarted.
- **Rate-Limited**: Configured with polite request pacing (~300ms) to avoid server throttling.
