# Phase 6: Real-Time Match System - Testing Guide

## 🎮 Overview
This guide will help you test the newly implemented **Real-Time Match System** with Socket.io integration, live score updates, and player analytics.

---

## 📋 Prerequisites

### Backend
1. MongoDB running (local or Atlas)
2. Node.js environment configured
3. All backend dependencies installed:
```bash
cd backend
npm install
```

### Frontend
1. Node.js environment configured
2. All frontend dependencies installed:
```bash
cd frontend
npm install
```

---

## 🚀 Starting the Application

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
✅ **Expected Output:**
```
Server running on port 5000
Connected to MongoDB
Socket.io ready for real-time connections
```

### Terminal 2 - Frontend Development Server
```bash
cd frontend
npm run dev
```
✅ **Expected Output:**
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 Testing Scenarios

### **Scenario 1: Create Match as Organizer**

#### Steps:
1. **Login as Organizer**
   - Navigate to `http://localhost:5173/login`
   - Use organizer credentials (email with `organizer` role)
   - Click "Login"

2. **Access Organizer Dashboard**
   - After login, navigate to `/organizer-dashboard`
   - You should see your created competitions

3. **Create a Match** (via API or Future UI Enhancement)
   Currently, matches are created programmatically. You can test by using the REST API:

   **Using Postman/Thunder Client:**
   ```http
   POST http://localhost:5000/api/matches/create
   Authorization: Bearer <your_organizer_token>
   Content-Type: application/json

   {
     "competitionId": "<competition_id>",
     "matchNumber": 1,
     "participants": ["<player1_id>", "<player2_id>", "<player3_id>"],
     "metadata": {
       "gameMode": "Battle Royale",
       "duration": 30
     }
   }
   ```

   ✅ **Expected Response:**
   ```json
   {
     "success": true,
     "data": {
       "_id": "match_id",
       "roomId": "match_<id>_<timestamp>",
       "status": "upcoming",
       "players": [...],
       "scores": {}
     }
   }
   ```

4. **Verify Match Created**
   - Check MongoDB Compass: `winzone` database → `matches` collection
   - Confirm match document exists

---

### **Scenario 2: Join Live Match as Player**

#### Steps:
1. **Open Match Page**
   - Navigate to: `http://localhost:5173/match/<matchId>`
   - Replace `<matchId>` with the actual match ID from step above

2. **Verify Socket Connection**
   - ✅ Connection status indicator should show **"Connected"** (green dot)
   - ✅ Room size should show **1** initially

3. **Open Multiple Browser Tabs/Windows**
   - Open same match URL in **2-3 different tabs** (simulating multiple players)
   - Each tab should auto-join the room

4. **Verify Real-Time Updates**
   - ✅ Each new tab join should:
     - Increment **"Online"** counter in all tabs
     - Show toast notification: `"<Player Name> joined the match"`
   - ✅ Player list should populate in all tabs simultaneously

---

### **Scenario 3: Start Match (Organizer)**

#### Prerequisites:
- Match must be in **"upcoming"** status
- Organizer must be logged in

#### Steps:
1. **Navigate to Match Page as Organizer**
   - Go to: `http://localhost:5173/match/<matchId>`
   - You should see **"Organizer Controls"** panel

2. **Start Match**
   - Click **"▶️ Start Match"** button
   - ✅ **Expected Real-Time Updates (All Tabs):**
     - Status badge changes to **"🔴 ONGOING"** (animated pulse)
     - Timer starts counting up from `00:00`
     - Toast notification: `"Match has started!"`

3. **Verify Backend Update**
   - Check database: Match `status` should be `"ongoing"`
   - `startedAt` timestamp should be populated

---

### **Scenario 4: Update Scores in Real-Time**

#### Steps:
1. **Select Player from Dropdown**
   - In **Organizer Controls** panel
   - Choose a player from the dropdown (shows current score)

2. **Enter Score**
   - Input a score (e.g., `150`)
   - Click **"✅ Update Score"**

3. **Verify Real-Time Broadcast**
   - ✅ **All tabs** should update instantly:
     - Leaderboard re-sorts with new score
     - Player's score in right sidebar updates
     - Toast notification: `"Score updated!"`
     - Animated transition on leaderboard position change

4. **Test Multiple Score Updates**
   - Update different players' scores
   - Verify leaderboard always shows correct order (highest → lowest)

---

### **Scenario 5: End Match and Calculate Winner**

#### Steps:
1. **Click "⏹️ End Match"** (Organizer Controls)
   - Confirm action in popup dialog

2. **Verify Winner Calculation**
   - ✅ **All tabs** should show:
     - Toast: `"🏆 Match ended! Winner: <Top Player Name>"`
     - Status changes to **"COMPLETED"**
     - Timer stops

3. **Check Player Stats Updated**
   - Navigate to: `http://localhost:5173/analytics`
   - ✅ **Verify Updated Stats:**
     - `matchesPlayed` +1 for all participants
     - Winner's `wins` +1
     - Losers' `losses` +1
     - `totalScore`, `averageScore`, `highestScore` updated

4. **Verify Database**
   - Check `matches` collection:
     - `status: "completed"`
     - `endedAt` timestamp populated
     - `winner` field set to player with highest score
   - Check `users` collection:
     - All participants' `stats` object updated

---

### **Scenario 6: View Analytics Page**

#### Steps:
1. **Navigate to Analytics**
   - Go to: `http://localhost:5173/analytics`
   - Should show current user's analytics

2. **Verify Charts**
   - ✅ **Wins vs Losses Bar Chart**
     - Green bar (Wins) and Red bar (Losses)
     - Correct counts

   - ✅ **Win Distribution Pie Chart**
     - Shows percentage split
     - Colored segments (green for wins, red for losses)

   - ✅ **Score Progression Line Chart**
     - Shows last 20 matches
     - Blue line with data points
     - Hover to see exact scores

3. **Check Stats Cards**
   - Total Matches
   - Win Rate (percentage)
   - Average Score
   - Highest Score

4. **Recent Matches Table**
   - Shows last 10 matches
   - Columns: Date, Competition, Score, Result (WIN/LOSS)
   - Winner badge (🏆) displayed correctly

---

### **Scenario 7: Test Socket Disconnect/Reconnect**

#### Steps:
1. **Join Match**
   - Open match page: `http://localhost:5173/match/<matchId>`
   - Verify connected (green dot)

2. **Stop Backend Server**
   - Kill backend terminal (Ctrl+C)
   - ✅ **Frontend should:**
     - Connection indicator turns red
     - Shows "Disconnected"

3. **Restart Backend**
   - Run `npm run dev` again in backend
   - ✅ **Frontend should:**
     - Auto-reconnect (within 10 seconds)
     - Connection indicator turns green
     - Shows "Connected"
     - No data loss

---

### **Scenario 8: Test Room Cleanup**

#### Steps:
1. **End a Match**
   - Follow Scenario 5 to end a match

2. **Wait 40 Seconds**
   - Backend auto-closes room after 40s
   - ✅ **Expected:**
     - Toast notification: `"Room will close in 40 seconds"`
     - All sockets disconnected from room
     - Room removed from Socket.io rooms list

3. **Verify Room Cleanup**
   - Check backend console logs
   - Should see: `"Room <roomId> closed"`

---

## 🐛 Common Issues & Solutions

### Issue 1: Socket Not Connecting
**Symptoms:**
- Red "Disconnected" indicator
- Console error: `"Connection failed"`

**Solutions:**
1. Verify backend running on port 5000
2. Check CORS configuration in `backend/src/config/socket.js`
3. Clear browser cache and reload

---

### Issue 2: Scores Not Updating in Real-Time
**Symptoms:**
- Score changes in one tab but not others
- No toast notifications

**Solutions:**
1. Check browser console for socket errors
2. Verify all tabs joined the same room (check `roomId`)
3. Restart both backend and frontend

---

### Issue 3: Match Not Starting
**Symptoms:**
- "Start Match" button not working
- No status change

**Solutions:**
1. Verify user is the organizer (check `match.organizerId === user._id`)
2. Check match status is "upcoming"
3. Check backend console for errors

---

### Issue 4: Analytics Not Showing
**Symptoms:**
- Empty analytics page
- No charts displayed

**Solutions:**
1. Verify user has played at least 1 match
2. Check browser console for API errors
3. Verify backend route `/api/matches/analytics/:userId` works

---

## 📊 Testing Checklist

### Backend Tests:
- [ ] Socket.io server initializes without errors
- [ ] Match CRUD endpoints work (create, get, update, delete)
- [ ] Socket events emit correctly (join, score update, end match)
- [ ] Player stats update after match ends
- [ ] Winner calculated correctly

### Frontend Tests:
- [ ] Socket connects on mount
- [ ] Real-time score updates in all tabs
- [ ] Leaderboard re-sorts instantly
- [ ] Timer works during ongoing match
- [ ] Analytics charts render correctly
- [ ] Toast notifications appear
- [ ] Mobile responsive UI

### Integration Tests:
- [ ] Organizer can create and manage matches
- [ ] Players see updates without refresh
- [ ] Multiple users can join same match
- [ ] Room cleanup after 40 seconds
- [ ] Disconnect/reconnect works smoothly

---

## 🎯 Success Criteria

✅ **Phase 6 is successful if:**
1. Organizers can create and manage matches via API
2. Players see real-time score updates without refresh
3. Socket.io connects reliably across multiple tabs
4. Match winner calculated and stats updated correctly
5. Analytics page displays accurate charts and data
6. No memory leaks or socket connection issues
7. All UI elements match cyberpunk gaming theme

---

## 🔧 Advanced Testing (Optional)

### Load Testing:
- Use **Artillery** or **k6** to simulate 100+ concurrent connections
- Test Socket.io performance under load

### Security Testing:
- Verify JWT authentication required for match operations
- Test role-based access (organizers vs players)
- Attempt unauthorized score updates (should fail)

### Performance Testing:
- Measure score update latency (target: <100ms)
- Test with 10+ players in single match
- Monitor backend memory usage

---

## 📝 Test Results Template

```markdown
## Test Session: [Date]

### Tester: [Your Name]
### Environment: Local Development

| Scenario | Status | Notes |
|----------|--------|-------|
| Create Match | ✅ Pass | Match created successfully |
| Join Room | ✅ Pass | All tabs connected |
| Start Match | ✅ Pass | Status updated real-time |
| Update Scores | ✅ Pass | Instant updates across tabs |
| End Match | ✅ Pass | Winner calculated correctly |
| Analytics | ✅ Pass | Charts render with data |
| Reconnect | ✅ Pass | Auto-reconnect works |
| Room Cleanup | ✅ Pass | Room closed after 40s |

**Issues Found:** None / [List issues]

**Overall Result:** ✅ PASS / ❌ FAIL
```

---

## 🎉 Conclusion

Phase 6 adds a complete **real-time match system** with:
- ✅ Socket.io bidirectional communication
- ✅ Live score updates across all connected clients
- ✅ Organizer match control panel
- ✅ Player analytics with Recharts
- ✅ Room-based architecture for match isolation
- ✅ Auto-cleanup and error handling

**Next Steps:**
- Add UI for creating matches directly from Organizer Dashboard
- Implement in-match chat feature
- Add match replay/history viewer
- Deploy to production (Render/Railway + MongoDB Atlas)

---

## 📞 Support

**Issues or Questions?**
- Check backend logs: `backend/` terminal
- Check frontend console: Browser DevTools (F12)
- Review Socket.io events: Network tab → WS (WebSocket)

**Documentation:**
- Socket.io Docs: https://socket.io/docs/v4/
- Recharts Docs: https://recharts.org/

---

**Happy Testing! 🚀🎮**
