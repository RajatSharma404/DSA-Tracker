# LeetCode Code Editor Integration - Setup Guide

## 🎯 Features Added

Your DSA Tracker now has a powerful **multi-language code editor** with **direct LeetCode submission**!

### Supported Languages:

- ✅ **C++**
- ✅ **C**
- ✅ **Java**
- ✅ **Python3**

## 🚀 How to Use

### Step 1: Set Your LeetCode Session Cookie

For the submission feature to work, you need to authenticate with LeetCode:

1. **Login to LeetCode** in your browser
2. **Open DevTools** (F12 or Right Click → Inspect)
3. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
4. Find **Cookies** → `https://leetcode.com`
5. Copy the value of `LEETCODE_SESSION` cookie
6. In your DSA Tracker, go to **Settings** and paste the session value

### Step 2: Start Solving Problems

1. Navigate to **Topics** page
2. Expand any topic to see problems
3. Click the **"Solve"** button on any problem
4. You'll be taken to the integrated code editor

### Step 3: Code and Submit

1. **Select your language** (C++, C, Java, or Python3)
2. The editor will auto-load the problem template
3. Write your solution
4. Click **"Submit to LeetCode"** button
5. Watch real-time submission status
6. On success, the problem is automatically marked as DONE!

## 📁 Files Modified/Created

### Backend:

- `backend/leetcodeService.ts` - Added submission functions
- `backend/index.ts` - Added API endpoints:
  - `GET /api/leetcode/problem/:titleSlug` - Get problem details
  - `POST /api/leetcode/submit` - Submit code to LeetCode
  - `GET /api/leetcode/submission/:id/check` - Check submission status
  - `GET /api/problems/:problemId` - Get single problem

### Frontend:

- `frontend/src/components/dashboard/LeetCodeEditor.tsx` - **NEW**: Multi-language editor
- `frontend/src/app/(dashboard)/problems/[problemId]/page.tsx` - **NEW**: Problem solve page
- `frontend/src/lib/api.ts` - Added submission methods
- `frontend/src/app/(dashboard)/topics/page.tsx` - Added "Solve" button

## 🎨 Features

### Code Editor:

- ✨ Syntax highlighting for all languages
- 🔍 Minimap navigation
- 🎯 Auto-completion
- 📝 Line numbers
- 🌙 Dark theme optimized

### Submission System:

- ⚡ Real-time submission tracking
- ✅ Auto status updates (Accepted/Wrong Answer/etc.)
- 📊 Runtime and memory stats
- 🎉 Auto-mark problem as DONE on acceptance
- 🔄 Polling mechanism for results

### Problem Solving Interface:

- 📖 Split view: Problem description + Code editor
- 🎨 Tab navigation: Code / AI Hints / Code Review / Notes
- 🔗 Direct link to LeetCode
- 🏷️ Difficulty badges
- 🔖 Topic tags

## 🔧 Technical Details

### Language Mappings:

```typescript
Monaco Editor → LeetCode API
--------------------------------
'cpp'          → 'cpp'
'c'            → 'c'
'java'         → 'java'
'python'       → 'python3'
```

### Submission Flow:

```
1. User writes code
2. Click "Submit to LeetCode"
3. Code sent to backend with language
4. Backend calls LeetCode submission API
5. Returns submission ID
6. Frontend polls for results every 1 second
7. Display final result (Accepted/Failed)
8. Update progress if accepted
```

## 🐛 Troubleshooting

### "LeetCode session cookie not set" Error:

- Make sure you've added your LEETCODE_SESSION cookie in settings
- Session cookies expire - you may need to refresh it periodically

### Submission not working:

- Verify your LeetCode session is still valid
- Check that the problem link in database matches LeetCode format
- Ensure you're logged into LeetCode in the same browser

### Code not loading:

- Check that the problem has a valid LeetCode link
- Verify the slug extraction is working (format: `leetcode.com/problems/two-sum/`)

## 🎯 Next Steps

Consider adding:

- 🧪 Test case runner (run code without submitting)
- 💾 Save drafts locally
- 📈 Submission history viewer
- 🏆 Leaderboard integration
- 🤖 More AI features (generate test cases, etc.)

## 📝 Environment Variables

Make sure these are set in your `.env` files:

**Backend (.env):**

```env
GEMINI_API_KEY=your-gemini-key  # For AI features
```

**Frontend (.env.local):**

```env
# LeetCode session will be stored in database per user
```

## 🎉 Enjoy Coding!

You can now solve problems directly in your DSA Tracker and automatically sync with LeetCode! 🚀
