# Replay-e-voting

A simple and intuitive e-voting system for neighborhood youth organization elections. This system allows voters to select candidates for Lead and Co-Lead positions.

## Features

- **Simple Interface**: Clean, user-friendly design with candidate photos
- **Two Position Voting**: Vote for both Lead (2 candidates) and Co-Lead (2 candidates)
- **Unique Vote Tracking**: Each vote is tagged with:
  - Unique identifier (UUID)
  - Date and time of submission
  - Timestamp in ISO format
- **Vote Storage**: Votes are stored in browser's localStorage
- **Auto-Refresh**: Page refreshes automatically after successful submission
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### For Voters

1. Open `index.html` in a web browser
2. Select one candidate for Lead position by clicking on their card
3. Select one candidate for Co-Lead position by clicking on their card
4. Click "Submit Vote" button
5. Wait for confirmation message and automatic page refresh
6. You can vote again after the page refreshes

### For Administrators

#### Customizing Candidate Photos

Replace the placeholder images in the `images/` folder with actual photos:
- `lead1.svg` → Replace with photo of Lead Candidate 1
- `lead2.svg` → Replace with photo of Lead Candidate 2
- `colead1.svg` → Replace with photo of Co-Lead Candidate 1
- `colead2.svg` → Replace with photo of Co-Lead Candidate 2

You can use JPG, PNG, or SVG formats. If using different formats, update the file extensions in `index.html`.

#### Viewing Vote Results

Open the browser console (F12) to see:
- Total number of votes cast
- Recent votes with all details
- All stored vote data

To export votes:
```javascript
// Run in browser console
const votes = JSON.parse(localStorage.getItem('votes'));
console.log(JSON.stringify(votes, null, 2));
```

To clear all votes (reset system):
```javascript
// Run in browser console
localStorage.removeItem('votes');
location.reload();
```

## File Structure

```
Replay-e-voting/
├── index.html          # Main HTML file with voting interface
├── styles.css          # Styling for the voting system
├── script.js           # JavaScript logic for voting and data storage
├── images/             # Candidate photos
│   ├── lead1.svg
│   ├── lead2.svg
│   ├── colead1.svg
│   └── colead2.svg
└── README.md          # This file
```

## Vote Data Structure

Each vote is stored with the following structure:

```json
{
  "uuid": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "lead": "lead1",
  "colead": "colead2",
  "input_date": "02/14/2026",
  "input_time": "03:32:45",
  "timestamp": "2026-02-14T03:32:45.123Z"
}
```

## Technical Details

- **No Backend Required**: Pure client-side application
- **Storage**: Uses browser's localStorage API
- **UUID Generation**: Uses standard UUID v4 format
- **Browser Compatibility**: Works on all modern browsers

## Deployment

Simply upload all files to any web server or open `index.html` directly in a browser. No server-side setup required.

## Security Notes

- This is a simple voting system suitable for **informal elections only**
- Votes are stored locally in the voter's browser
- **Multiple votes are allowed**: The system intentionally allows users to vote multiple times after page refresh, which is suitable for testing and informal scenarios
- For production use with formal elections, you should implement:
  - **Voter authentication**: Verify voter identity before allowing votes
  - **Vote-once protection**: Prevent users from voting multiple times (server-side tracking)
  - **Server-side vote storage**: Store votes securely on a backend server
  - **Vote encryption**: Protect vote data in transit and at rest
  - **Audit trails**: Track all voting activities for verification
  - **Ballot secrecy**: Separate voter identity from vote choices

## License

Open source - feel free to modify and use for your organization.