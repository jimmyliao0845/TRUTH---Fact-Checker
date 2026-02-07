# Game System Implementation - Points, Limits & Rewards

## Overview

Implemented complete game system with:

- **Daily Limits**: 5 games per day per user
- **10-Second Timer**: Each question has 10-second time limit
- **Points System**: 200-1000 points based on difficulty, accuracy, and speed
- **Game Reviews**: Users can leave star ratings and comments on games
- **Return to Games**: Easy navigation back to category selection

---

## 1. Daily Game Limit (5 Games/Day)

### Implementation

- **Storage Key**: `lastGamePlayDate` and `gamesPlayedToday` in localStorage
- **Tracking**: Automatically resets counter each day
- **Enforcement**: User cannot start a 6th game (alert shown)

### Code Flow

```javascript
// On GamePage load, check if it's a new day
const today = new Date().toDateString();
const lastDate = localStorage.getItem("lastGamePlayDate");

if (lastDate !== today) {
  // Reset counter for new day
  localStorage.setItem("lastGamePlayDate", today);
  localStorage.setItem("gamesPlayedToday", "0");
}

// When user completes a game, increment counter
const newCount = gamesPlayedToday + 1;
localStorage.setItem("gamesPlayedToday", newCount.toString());
```

### User Experience

- Before game start: Check `gamesPlayedToday < 5`
- If limit reached: Alert shows "You've reached your 5-game daily limit!"
- On GameResult: Displays "X games remaining today" or "Daily limit reached"
- If 0 remaining: Play Again button is hidden

---

## 2. 10-Second Timer Per Question

### Implementation

- **Location**: GameScreen.jsx
- **Timer Reset**: Resets to 10 seconds when new question loads
- **Visual Feedback**:
  - Timer turns red ⚠️ when <= 3 seconds
  - Shows "Xs" countdown in header
- **Auto-Advance**: If time runs out, moves to next question (counts as wrong)

### Timer Logic

```javascript
useEffect(() => {
  if (answered || timeLeft <= 0) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setAnswered(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, answered]);

// Auto-advance when timer expires
useEffect(() => {
  if (timeLeft === 0 && answered) {
    setTimeout(() => {
      onAnswerQuestion(null, { timeLeft: 0 }); // timeout = wrong answer
    }, 500);
  }
}, [timeLeft, answered, onAnswerQuestion]);
```

### Scoring Impact

- Time bonus = (timeLeft / 10) = 0 to 1
- Faster answers = higher points
- If time runs out = 0 time bonus, counted as wrong answer

---

## 3. Points Calculation System

### Points Range

- **Minimum**: 200 points
- **Maximum**: 1000 points

### Formula

```
Points = 200 + (correctRatio × 600) + (timeBonus × 200) + (difficultyMultiplier × 100)
Final Points = min(max(basePoints, 200), 1000)
```

### Components

#### 3.1 Difficulty Multiplier

| Difficulty   | Multiplier | Example Base Points |
| ------------ | ---------- | ------------------- |
| Beginner     | 1          | 200-400             |
| Intermediate | 3          | 500-700             |
| Advanced     | 5          | 800-1000            |

#### 3.2 Correct Answers Ratio

- Ratio = Correct Answers / Total Questions
- If 8/10 correct = 0.8 ratio
- Adds 0-600 points (80% of questions = +480 points)

#### 3.3 Time Bonus

- Bonus = (Seconds Remaining / 10)
- Quick answer (9s left) = 0.9 bonus = +180 points
- Slow answer (2s left) = 0.2 bonus = +40 points
- Timeout (0s) = 0.0 bonus = +0 points

#### 3.4 Experience Examples

**Example 1: Beginner Game - Good Performance**

- Difficulty: Beginner (×1)
- Correct: 9/10 (ratio = 0.9)
- Time: 7 seconds left (bonus = 0.7)
- Calculation: 200 + (0.9 × 600) + (0.7 × 200) + (1 × 100)
- **= 200 + 540 + 140 + 100 = 980 points**

**Example 2: Advanced Game - Average Performance**

- Difficulty: Advanced (×5)
- Correct: 5/10 (ratio = 0.5)
- Time: 4 seconds left (bonus = 0.4)
- Calculation: 200 + (0.5 × 600) + (0.4 × 200) + (5 × 100)
- **= 200 + 300 + 80 + 500 = 1080 → capped at 1000 points**

**Example 3: Intermediate Game - Slow Performance**

- Difficulty: Intermediate (×3)
- Correct: 6/10 (ratio = 0.6)
- Time: 1 second left (bonus = 0.1)
- Calculation: 200 + (0.6 × 600) + (0.1 × 200) + (3 × 100)
- **= 200 + 360 + 20 + 300 = 880 points**

**Example 4: Timeout - Minimum Points**

- Correct: 3/10 (ratio = 0.3)
- Timeout: 0 seconds (bonus = 0)
- Calculation: 200 + (0.3 × 600) + (0 × 200) + (× multiplier)
- **= 200 + 180 + 0 + X = Minimum viable points**

---

## 4. Game Result Screen

### Display Information

1. **Game Title**: Shows which game was played
2. **Score**: "Score: 7/10"
3. **Accuracy**: "Accuracy: 70%"
4. **Points Earned**: Large display showing "+850 POINTS"
5. **Daily Status**: "4 games remaining today" or "Daily limit reached"
6. **Review Section**:
   - Star rating (1-5)
   - Comment text area
   - Submit/Cancel buttons
7. **Action Buttons**:
   - Play Again (if games remaining)
   - Return to Games (always available)

### Review System

- **Storage Key**: `game_reviews` in localStorage
- **Data Saved**:
  - Game ID and title
  - Star rating (1-5)
  - Comment text
  - Timestamp
  - Player ID (TODO: use Firebase UID)
- **Validation**: Requires comment to not be empty

### Code Structure

```javascript
// Save review
const reviews = JSON.parse(localStorage.getItem("game_reviews") || "[]");
reviews.push({
  gameId: selectedGame.id,
  gameName: selectedGame.title,
  rating: reviewRating,
  comment: reviewComment,
  date: new Date().toISOString(),
  playerId: "current-user",
});
localStorage.setItem("game_reviews", JSON.stringify(reviews));
```

---

## 5. Integration Points

### A. GameScreen.jsx

- Displays 10-second timer with visual warnings
- Handles answer selection with timing data
- Passes `timing` object to onAnswerQuestion with:
  - `difficulty`: game difficulty level
  - `timeBonus`: calculated time factor
  - `timeLeft`: seconds remaining
  - `difficultyMultiplier`: difficulty × factor

### B. GamePage.jsx

- Tracks daily game count
- Checks 5-game limit before allowing game start
- Calls `calculateGamePoints()` function when game finishes
- Stores `gamesPlayedToday` in localStorage
- Increments counter on game completion

### C. GameResult.jsx

- Displays points earned prominently
- Shows daily games remaining
- Allows user to leave reviewed with rating + comment
- "Return to Games" button goes back to category selection

### D. GameFinder.jsx

- Users browse games by category
- Can filter/sort by maker, popularity, date
- Select any game to play (if under daily limit)

---

## 6. Future Analysis Page Integration

### Text Verification Points (Analysis Page)

- **Points**: 50 points per entry
- **Daily Limit**: 5 entries/day
- **Storage**: Track in localStorage with date

### Image/Video Verification Points (Analysis Page)

- **Points**: 300 points per entry
- **No daily limit**: Can do multiple
- **Storage**: Track in localStorage with date

### Implementation Ready

- Both should be created in AnalysisPageLoggedIn.jsx
- Save to `analysis_points` and `analysis_entries_today` in localStorage
- Points auto-add to user total points balance

---

## 7. Marketplace Connection

### Points Usage

- User accumulates points from:
  - Games (200-1000 per game)
  - Text verification (50 per entry, max 5/day)
  - Image/Video verification (300 each)
- Points can be spent in marketplace (implementation pending)

### Required Integrations

1. Track total points balance in localStorage: `user_total_points`
2. Update on game completion: `parseInt(localStorage.getItem('user_total_points')) + pointsEarned`
3. Display in user profile/dashboard
4. Use in marketplace for purchases

---

## 8. localStorage Structure

```javascript
// Game Sessions
"lastGamePlayDate": "Fri Feb 07 2026"
"gamesPlayedToday": "3"

// Game Reviews
"game_reviews": [
  {
    gameId: "game-123456",
    gameName: "Real vs Fake Images",
    rating: 5,
    comment: "Great game!",
    date: "2026-02-07T10:30:00.000Z",
    playerId: "user-id"
  }
]

// Points (Future Integration)
"user_total_points": "2850"
"analysis_entries_today": "3"
"analysis_points": "150"
```

---

## 9. Complete User Flow

```
1. User logs in → GamePage
2. Selects category (e.g., "Text Games")
   ↓
3. GameFinder shows games in category (sorted by popularity/rating)
4. Selects a game
5. CHECK: Is gamesPlayedToday < 5?
   - Yes → Start game
   - No → Show alert "5-game daily limit reached"
6. GameScreen loads with 10-second timer
7. User answers questions:
   - Timer counts down
   - Auto-advances on timeout
   - Timing data collected
8. Game completes
9. calculateGamePoints() runs:
   - Difficulty multiplier × correct ratio × time bonus × base points
   - Result: 200-1000 points
10. GameResult shows:
    - Score: 7/10
    - Accuracy: 70%
    - Points: +750
    - Games remaining: 2
    - Review form (optional)
11. User chooses:
    - Play Again (if games remain)
    - Return to Games (back to category)
    - Leave Review
12. Points added to balance
13. Counter incremented for next game
14. Return to step 2 (or reach daily limit)
```

---

## 10. Testing Checklist

- [ ] Daily limit resets at midnight
- [ ] Cannot play 6th game (alert shown)
- [ ] Timer counts down properly
- [ ] Timeout auto-advances game
- [ ] Points calculated correctly for all difficulties
- [ ] Points displayed on result screen
- [ ] Review form accepts and saves reviews
- [ ] Play Again only shows if games remaining
- [ ] Return to Games button works
- [ ] localStorage updates properly
- [ ] Games remaining counter accurate
- [ ] Points vary based on speed and accuracy

---

## 11. Files Modified

✅ **GameScreen.jsx**

- Added 10-second timer
- Visual warning when time critical (<=3s)
- Auto-advance on timeout
- Passes timing data to parent

✅ **GamePage.jsx**

- Daily limit tracking
- Points calculation function
- Daily counter management
- Prevents 6th game play

✅ **GameResult.jsx**

- Points display (200-1000 range)
- Review system (star rating + comment)
- Daily games remaining counter
- Return to Games button
- Play Again conditional (only if games remain)

✅ **GameFinder.jsx**

- No changes needed (already loads games by category)

---

## Next Steps

1. **Backend Integration**: Replace localStorage with API calls for:
   - Daily game limits
   - Points storage
   - Review persistence
   - User total points balance

2. **Analysis Page**: Implement text/image/video verification with points:
   - Text = 50 points (limit 5/day)
   - Image/Video = 300 points (no limit)

3. **Marketplace**: Build UI to spend points on items

4. **Firebase Auth**: Use actual user IDs instead of "current-user"

5. **Analytics**: Track which games are most played, best reviewed, etc.
