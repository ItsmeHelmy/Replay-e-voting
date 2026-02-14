# Quick Start Guide

## For Voters

1. **Open the application**
   - Double-click `index.html` or open it in any modern web browser
   - Or host it on a web server and navigate to the URL

2. **Cast your vote**
   - Click on ONE candidate card in the "Lead Position" section
   - Click on ONE candidate card in the "Co-Lead Position" section
   - Both selections are required before you can submit
   - Selected candidates will be highlighted with a blue border

3. **Submit**
   - Click the "Submit Vote" button at the bottom
   - You'll see a green success message
   - The page will automatically refresh after 2 seconds

4. **Vote again** (if needed for informal elections)
   - After the page refreshes, you can cast another vote
   - Each vote gets a unique identifier and timestamp

## For Administrators

### Customizing Candidate Information

Replace the placeholder images in the `images/` folder:
- `lead1.svg` → Photo of Lead Candidate 1
- `lead2.svg` → Photo of Lead Candidate 2
- `colead1.svg` → Photo of Co-Lead Candidate 1
- `colead2.svg` → Photo of Co-Lead Candidate 2

To update candidate names, edit `index.html`:
- Find the `<label>` tags (e.g., `<label for="lead1">Candidate 1</label>`)
- Change "Candidate 1" to the actual candidate name

### Viewing Results

**In the browser:**
1. Press F12 to open Developer Tools
2. Go to the "Console" tab
3. The total vote count is displayed automatically
4. Type `localStorage.getItem('votes')` to see all votes

**Exporting votes to JSON:**
```javascript
// Copy/paste this in the browser console
const votes = JSON.parse(localStorage.getItem('votes'));
console.log(JSON.stringify(votes, null, 2));
// Then copy the output
```

### Analyzing Results

**Count votes for each candidate:**
```javascript
// Run in browser console
const votes = JSON.parse(localStorage.getItem('votes')) || [];
const results = {
  lead1: votes.filter(v => v.lead === 'lead1').length,
  lead2: votes.filter(v => v.lead === 'lead2').length,
  colead1: votes.filter(v => v.colead === 'colead1').length,
  colead2: votes.filter(v => v.colead === 'colead2').length,
  total: votes.length
};
console.log('Results:', results);
```

### Resetting the System

**Clear all votes:**
```javascript
// Run in browser console
localStorage.removeItem('votes');
location.reload();
```

## Hosting Options

### Option 1: Open Locally
- No setup needed
- Just open `index.html` in a browser
- Votes stored in browser's localStorage

### Option 2: Simple Web Server
```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server)
npx http-server
```
Then navigate to `http://localhost:8000`

### Option 3: Deploy to Web
Upload all files to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web hosting provider

## Troubleshooting

**Problem: Vote not submitting**
- Ensure you've selected one candidate from EACH position
- Check browser console (F12) for any error messages

**Problem: Votes not persisting**
- Make sure you're using the same browser
- Check that cookies/localStorage are not blocked
- Try a different browser if issues persist

**Problem: Images not showing**
- Verify image files exist in the `images/` folder
- Check file paths in `index.html` match actual filenames
- Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)

## Support

For issues or questions, refer to:
- `README.md` - Full documentation
- `TEST_RESULTS.md` - Test verification
- Browser Developer Console - Real-time debugging
