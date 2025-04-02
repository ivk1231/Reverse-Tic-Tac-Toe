

# Product Requirements Document (PRD): Reverse Tic-Tac-Toe

## 1. Overview

### 1.1 Product Name
Reverse Tic-Tac-Toe

### 1.2 Product Description
Reverse Tic-Tac-Toe is a two-player strategy game where the objective is to force the opponent to complete a line of three identical symbols (X or O) on a 4x4 or 5x5 grid. Lines can be horizontal, vertical, or diagonal. The game offers two modes:
- **Offline Mode**: Two players play locally on the same device.
- **Online Mode**: Two players play over the internet using a room-based system with a shareable room code.
The game is web-based, hosted for free on GitHub Pages (frontend) and Firebase Realtime Database’s Spark Plan (backend for online mode). It is fully responsive for phone and desktop, ensuring anyone with a browser can play without cost or setup. The game will be built using Cursor to streamline development with clean, cost-efficient code.

### 1.3 Objective
To create a free, engaging, and accessible game that:
- Implements reverse Tic-Tac-Toe mechanics with clear win/loss conditions.
- Supports offline (local) and online (room-based) play on 4x4 or 5x5 grids.
- Ensures zero-cost hosting and play using GitHub Pages and Firebase’s free tier.
- Provides a responsive UI for phone and desktop, making it easy to share and play.
- Leverages Cursor’s AI-assisted coding to build efficiently and maintain quality.

### 1.4 Target Audience
- Casual gamers who enjoy strategy games like Tic-Tac-Toe.
- Friends or family looking for a quick, free game to play together, locally or online.
- Developers experimenting with Firebase and web game development.
- Users on phone or desktop seeking an accessible, no-cost gaming experience.

## 2. Features and Requirements

### 2.1 Core Gameplay
- **Game Modes**:
  - **Offline Mode (Local)**:
    - Two players take turns on the same device, placing X or O on the grid.
    - No internet or backend required; runs entirely in the browser.
  - **Online Mode**:
    - Two players play remotely via a room-based system.
    - Host creates a room, generating a unique code (e.g., “ABCD123”) to share with the opponent.
    - Opponent joins by entering the code in the game’s UI, connecting via Firebase.
    - Moves sync in real time; no accounts or payments required.
- **Objective**: Force the opponent to have three of their symbols (X or O) in a row (horizontal, vertical, or diagonal), causing them to lose.
- **Grid Sizes**:
  - Selectable 4x4 or 5x5 grid before starting (default: 4x4).
  - In online mode, the host chooses the grid size.
- **Turn Mechanics**:
  - Players alternate turns, starting with Player 1 (X).
  - Each turn places a symbol in an empty cell.
  - Offline: Turns are immediate.
  - Online: Firebase enforces turn order, showing “Waiting for opponent” when not the player’s turn.
- **Win/Loss Conditions**:
  - A player loses if their symbol forms a line of three (row, column, diagonal).
  - If the grid fills without a loss, the game ends in a draw.
- **Game Reset**:
  - Offline: “Restart” button clears the board for a new game with the same grid size.
  - Online: Both players must click “Restart” to start a new game; otherwise, the room closes, and a new room can be created.

### 2.2 User Interface
- **Landing Page**:
  - Buttons for “Play Offline” and “Play Online.”
  - Brief “How to Play” section explaining the reverse objective and sharing process (e.g., “Share the URL and room code to play online for free!”).
  - “Play for Free” text to clarify no costs or accounts needed.
- **Game Board**:
  - Displays a 4x4 or 5x5 grid with clickable/tappable cells showing X, O, or empty.
  - Responsive design scales for phone (e.g., 320px) and desktop (e.g., 1440px).
  - Cells are touch-friendly (≥48px) on mobile and support mouse clicks on desktop.
- **Grid Selection**:
  - Dropdown or buttons to choose 4x4 or 5x5 before starting.
  - Online: Host selects; opponent sees the chosen grid.
- **Online Play UI**:
  - **Create Room**: Generates a room code (e.g., “Your Room Code: ABCD123”) with a “Copy Invite” button to copy the GitHub Pages URL + code.
  - **Join Room**: Input field for entering the code, with “Join” button and feedback (e.g., “Connected!” or “Invalid code”).
  - Connection status (e.g., “Waiting for opponent,” “Opponent joined,” “Opponent disconnected”).
- **Game Status**:
  - Shows current turn (e.g., “Player X’s Turn”).
  - Displays win/loss (e.g., “Player X Loses!”) or draw messages.
  - Online: Notifies if opponent disconnects (e.g., “Opponent left; return to menu”).
- **Responsive Design**:
  - Single-column layout on phones; centered layout on desktops.
  - Text and buttons are legible without zooming (min font size: 16px).
  - Optional hover effects on desktop (e.g., cell highlight) that don’t affect mobile.
- **Visual Feedback** (Optional):
  - Highlight the losing line of three symbols (e.g., with color) when a game ends.

### 2.3 Technical Requirements
- **Platform**: Web-based, hosted on GitHub Pages (free tier) for the frontend, accessible via a free subdomain (e.g., `username.github.io/reverse-tic-tac-toe`).
- **Tech Stack**:
  - **Frontend**: HTML, CSS, JavaScript (Vanilla JS for simplicity), deployed as a static site.
  - **Backend**: Firebase Realtime Database (Spark Plan, free) for online mode, handling room creation, move sync, and game state.
  - **Development Tool**: Cursor for AI-assisted coding, debugging, and optimization.
  - **Storage**: LocalStorage for grid size preference; Firebase for online game state (within 1 GB free limit).
  - **Version Control**: Git and GitHub for free source control and GitHub Pages deployment.
- **Performance**:
  - Frontend loads in <2 seconds on mobile networks via GitHub Pages’ CDN.
  - Online mode syncs moves in <1 second on stable networks (Wi-Fi, 4G).
  - Firebase writes are minimal (<100 bytes/move) to stay within 10 GB/month transfer limit.
- **Code Quality**:
  - Modular structure with separate files for game logic, UI, and Firebase integration.
  - Cursor-generated code includes comments for key functions (e.g., win detection, room joining).
  - Optimize Firebase queries to avoid exceeding free-tier limits (e.g., close inactive rooms).
  - Optional: Basic unit tests for win detection if time permits.

### 2.4 Non-Functional Requirements
- **Cost**:
  - Hosting and playing are free using GitHub Pages (100 GB bandwidth/month) and Firebase Spark Plan (100 concurrent connections, 10 GB transfer/month).
  - No accounts, subscriptions, or payments required for players or developer.
- **Usability**:
  - Joining an online game takes ≤3 clicks (e.g., enter code, join).
  - Sharing requires only the GitHub Pages URL and room code, with “Copy Invite” for ease.
  - Instructions are clear for non-technical users (e.g., “Paste the code to play free”).
- **Accessibility**:
  - Support touch, click, and keyboard navigation (e.g., arrow keys for cell selection).
  - Ensure sufficient color contrast and screen reader compatibility for room code input.
- **Reliability**:
  - Online mode handles invalid codes, disconnections, or network errors with clear messages.
  - Game operates within free-tier limits for small-scale use (e.g., <50 concurrent games).
- **Maintainability**:
  - Modular code allows future updates (e.g., new grid sizes).
  - Document GitHub Pages and Firebase setup for redeployment.
- **Scalability**:
  - Free tier supports small audiences; local mode is fallback if limits are approached.

## 3. Scope

### 3.1 In-Scope
- Offline (local) two-player mode running in the browser.
- Online two-player mode with room-based play via Firebase Spark Plan.
- Free hosting on GitHub Pages (frontend) and Firebase (backend).
- Responsive design for phone and desktop, ensuring playability when shared.
- 4x4 and 5x5 grids with win/loss detection and restart functionality.
- Easy sharing via URL + room code with “Copy Invite” option.
- Development using Cursor for efficiency and cost optimization.

### 3.2 Out-of-Scope
- Random matchmaking or public lobbies for online play.
- AI opponent or single-player mode.
- Native mobile apps (web only).
- Custom symbols beyond X and O.
- Grid sizes beyond 4x4 or 5x5.
- Paid hosting or premium Firebase plans.
- Custom domains or advanced Firebase features (e.g., Cloud Functions).

## 4. User Stories
1. **As a player**, I want to play offline with a friend on one device so we can enjoy the game without internet.
2. **As a player**, I want to play online by sharing a room code so I can compete with someone remotely for free.
3. **As a player**, I want to join an online game with just a URL and code so I don’t need accounts or payments.
4. **As a player**, I want to choose a 4x4 or 5x5 grid to vary the challenge.
5. **As a player**, I want the game to work on my phone or desktop so I can play anywhere.
6. **As a player**, I want clear instructions and feedback (e.g., whose turn, who lost) to understand the game easily.
7. **As a developer**, I want to host the game for free on GitHub Pages and Firebase to avoid costs.
8. **As a developer**, I want to use Cursor to build quickly and keep code efficient for free-tier limits.

## 5. Acceptance Criteria
- **Free Hosting and Play**:
  - Game is hosted on GitHub Pages’ free tier, accessible via a free subdomain (e.g., `username.github.io/reverse-tic-tac-toe`).
  - Online mode runs on Firebase Spark Plan, supporting ≥10 concurrent games (20 players) within free limits (100 connections, 10 GB transfer/month).
  - Players access both modes without accounts, payments, or subscriptions.
  - Game data stays within Firebase’s 1 GB storage and 10 GB transfer/month for small-scale use (e.g., 100 games/month).
- **Offline Mode**:
  - Two players can play locally on one device with no internet.
  - Turns alternate correctly, and win/loss/draw conditions are detected accurately.
- **Online Mode**:
  - Host creates a room and sees a unique code within 1 second.
  - Host copies a shareable invite (URL + code) with one click via “Copy Invite.”
  - Opponent joins by entering a valid code, connecting in <2 seconds on stable networks.
  - Invalid codes show an error (e.g., “Room not found; check code”).
  - Moves sync in real time (<1 second delay), with turn order enforced.
  - Disconnections end the game with a message (e.g., “Opponent left”).
- **Gameplay**:
  - Players place X or O in empty cells to force the opponent to get three in a row.
  - Win detection works for horizontal, vertical, and diagonal lines on 4x4 or 5x5 grids.
  - Draw is declared if the grid fills without a loss.
  - Restart clears the board (offline) or requires mutual agreement (online).
- **Responsive Design**:
  - Game is playable on phones (e.g., iPhone SE, 320px) and desktops (e.g., 1440px) with no clipping or inaccessible elements.
  - Cells are touch-friendly (≥48px) and clickable without misclicks.
  - Room code input, “Copy Invite,” and instructions are usable on all devices.
- **UI/UX**:
  - Landing page includes “Play for Free” text and “How to Play” section for offline and online modes.
  - Online UI shows connection status (e.g., “Waiting for opponent,” “Game started”).
  - Instructions are visible without zooming, guiding users to share and join.

## 6. Development Plan

### 6.1 Milestones
1. **Setup and Initial Structure** (2-3 hours):
   - Create GitHub repository and set up GitHub Pages for free hosting.
   - Initialize HTML/CSS/JS files and Firebase Spark Plan (no credit card needed).
   - Deploy basic landing page to GitHub Pages and verify URL.
2. **Offline Gameplay Logic** (3-4 hours):
   - Implement grid data structure, turn mechanics, and win detection.
   - Style responsive game board with CSS Grid for phone/desktop.
   - Test local play for 4x4 and 5x5 grids.
3. **Online Gameplay Logic** (5-6 hours):
   - Set up Firebase for room creation, joining, and move sync.
   - Implement minimal data writes (<100 bytes/move) to stay within free limits.
   - Test room-based play with two browsers simulating remote players.
4. **Responsive UI Implementation** (3-4 hours):
   - Style landing page with offline/online buttons and instructions.
   - Add online UI for room code display, input, and “Copy Invite.”
   - Test touch/click interactions and layout on small and large screens.
5. **Grid Size Selection** (1 hour):
   - Add UI for choosing 4x4 or 5x5 grids, functional in both modes.
   - Ensure host’s choice syncs to opponent in online mode.
6. **Testing and Polish** (3-4 hours):
   - Test offline and online modes for bugs (e.g., win detection, desyncs).
   - Verify Firebase usage (<10 GB transfer/month for 100 games).
   - Confirm responsive design on DevTools (phone/desktop) and physical devices if available.
   - Optimize with Cursor for minimal data and fast load times.
7. **Final Review and Deployment** (2 hours):
   - Deploy final version to GitHub Pages and test Firebase integration.
   - Share URL and test room code to confirm playability.
   - Ensure all acceptance criteria are met.

### 6.2 Estimated Timeline
- Total: ~19-24 hours, spread over 1-2 weeks for a solo developer.
- Assumes basic familiarity with HTML/CSS/JS and Cursor usage.

### 6.3 Tools
- **Cursor**: For AI-assisted coding, debugging, and optimization.
- **Git/GitHub**: For free version control and GitHub Pages hosting.
- **Firebase Console**: For setting up and monitoring Spark Plan usage.
- **Browser DevTools**: For responsive testing (phone/desktop emulation).
- **Text Editor**: VS Code with Cursor integration.

## 7. Assumptions and Constraints

### 7.1 Assumptions
- GitHub Pages (100 GB bandwidth/month) and Firebase Spark Plan (100 connections, 10 GB transfer/month) suffice for small-scale use (<100 players/month).
- Players have modern browsers (Chrome, Firefox, Safari) and, for online mode, internet access.
- Developer monitors Firebase usage via the Console to stay within free limits.
- Basic JavaScript/CSS knowledge is enough with Cursor’s assistance.

### 7.2 Constraints
- Time: ~19-24 hours, with no monetary cost for hosting/tools.
- Firebase Free Tier: 100 concurrent connections, 1 GB storage, 10 GB transfer/month, adequate for prototype but not large-scale public use.
- GitHub Pages: Static hosting only, no server-side logic (Firebase handles backend).
- No budget for paid hosting, domains, or premium services.

## 8. Risks and Mitigation

- **Risk**: Firebase free-tier limits are exceeded if shared widely.
  - **Mitigation**: Optimize writes (<100 bytes/move); close inactive rooms; monitor usage; fallback to offline mode.
- **Risk**: GitHub Pages bandwidth limits cause downtime (unlikely).
  - **Mitigation**: Game is <1 MB; limits far exceed needs for small audiences.
- **Risk**: Responsive design fails on certain devices.
  - **Mitigation**: Test with DevTools for 320px-1440px; use simple CSS Grid layout.
- **Risk**: Players find sharing/joining confusing.
  - **Mitigation**: Add clear “How to Play” text; implement “Copy Invite” for one-click sharing; show error messages for invalid codes.
- **Risk**: Online games desync due to network issues.
  - **Mitigation**: Use Firebase for server-side turn validation; display clear disconnection messages.

## 9. Future Enhancements
- Add random matchmaking if Firebase limits allow.
- Support larger grids (e.g., 6x6) or custom symbols.
- Introduce basic animations for moves or win highlights.
- Add score tracking across multiple games.
- Explore offline storage for game history (LocalStorage).

## 10. Success Metrics
- **Functional**: Both offline and online modes implement reverse Tic-Tac-Toe rules with no critical bugs.
- **Cost**: Hosted and playable for free, staying within GitHub Pages and Firebase free-tier limits.
- **Usability**: Players complete games (offline or online) without confusion; joining online takes <3 clicks.
- **Accessibility**: Game works on phone and desktop for anyone with the shared URL/code.
- **Development**: Completed in ~19-24 hours using Cursor efficiently.

---

## Instructions for Using Cursor to Build the Game

To build Reverse Tic-Tac-Toe with Cursor, you’ll need to perform specific tasks to leverage its AI-assisted coding capabilities. Below are step-by-step instructions for you, organized by PRD milestones. Each instruction includes prompts to use in Cursor, actions you should take, and tips to ensure success. These assume you have Cursor set up in VS Code and a basic understanding of creating files and running a local server.

### Prerequisites
1. **Set Up Environment**:
   - Install VS Code and Cursor (free tier is fine for this project).
   - Create a free GitHub account if you don’t have one.
   - Sign up for Firebase (free Spark Plan) at `console.firebase.google.com` (no credit card needed).
   - Install Git (`git --version` to check) and Node.js (`node --version`) for local testing.
2. **Create Project Folder**:
   - Open VS Code, select “File > Open Folder,” and create a new folder (e.g., `reverse-tic-tac-toe`).
   - Initialize a Git repository: Run `git init` in the terminal (VS Code’s integrated terminal).
3. **Prepare Cursor**:
   - Ensure Cursor is active (you’ll see AI suggestions as you type).
   - Use `Ctrl+Enter` (or equivalent) to accept Cursor’s code suggestions.
   - Use the Cursor Composer (if available) for multi-file tasks by typing `Cmd+T` and entering prompts.

### Milestone 1: Setup and Initial Structure (~2-3 hours)
**Your Tasks**:
1. **Create GitHub Repository**:
   - Go to `github.com`, create a public repository named `reverse-tic-tac-toe`.
   - Enable GitHub Pages: In the repo, go to Settings > Pages, set Source to “Deploy from a branch,” select `main` branch, and save. Note the URL (e.g., `username.github.io/reverse-tic-tac-toe`).
   - Clone the repo locally: `git clone https://github.com/username/reverse-tic-tac-toe.git`.
2. **Initialize Project Files**:
   - In VS Code, open the project folder.
   - Create `index.html`, `styles.css`, `script.js`, and `firebase.js`.
3. **Set Up Firebase**:
   - In Firebase Console, create a new project (e.g., “Reverse Tic-Tac-Toe”).
   - Enable Realtime Database, choose a region, and start in test mode (insecure for now; secure later).
   - Copy the Firebase config object (from Project Settings > Your Apps > SDK setup).
4. **Deploy Basic Page**:
   - Test locally with a live server (e.g., VS Code’s “Live Server” extension or `npx serve`).
   - Commit and push to GitHub: `git add .`, `git commit -m "Initial setup"`, `git push origin main`.
   - Verify the page loads at `username.github.io/reverse-tic-tac-toe`.

**Cursor Prompts**:
- **HTML Structure**: In `index.html`, type: “Generate HTML for a game landing page with buttons for ‘Play Offline’ and ‘Play Online’ and a ‘How to Play’ section.” Accept the suggestion and tweak text to include “Play for Free.”
- **Basic CSS**: In `styles.css`, prompt: “Create CSS for a centered, responsive landing page with buttons and text for phone and desktop.” Ensure it uses `vw`/`rem` units.
- **Firebase Setup**: In `firebase.js`, prompt: “Generate code to initialize Firebase Realtime Database with this config: [paste your Firebase config].” Verify the config matches your Firebase project.
- **GitHub Pages Config**: If needed, prompt: “Show me how to configure GitHub Pages for a static site in a GitHub repository.” Follow the steps to ensure the `main` branch is set.

**Tips**:
- Save Firebase config securely (don’t commit it publicly; use environment variables later if needed).
- Test the landing page in Chrome DevTools (toggle device toolbar for 320px and 1440px).
- If Cursor suggests complex frameworks (e.g., React), reject and re-prompt for Vanilla JS.

### Milestone 2: Offline Gameplay Logic (~3-4 hours)
**Your Tasks**:
1. **Implement Game Logic**:
   - In `script.js`, write functions for grid state, turns, and win detection.
   - Use a 2D array for the grid (e.g., `let board = Array(4).fill().map(() => Array(4).fill(null))`).
2. **Style Game Board**:
   - Update `styles.css` for a responsive grid.
   - Test clicks on cells to ensure they register correctly.
3. **Test Offline Mode**:
   - Run locally and play a full game (4x4 and 5x5) to verify win/loss/draw.
   - Commit changes: `git add .`, `git commit -m "Offline gameplay"`, `git push`.

**Cursor Prompts**:
- **Game Logic**: In `script.js`, prompt: “Generate JavaScript for a 4x4 Tic-Tac-Toe game where players alternate X and O, with functions to check for three in a row (horizontal, vertical, diagonal).” Modify to handle 5x5 and reverse objective (lose on three-in-a-row).
- **Win Detection**: If stuck, prompt: “Write a function to check if a player has three identical symbols in a row on a 4x4 grid.” Test separately with console logs.
- **Responsive Grid**: In `styles.css`, prompt: “Create CSS Grid for a 4x4 Tic-Tac-Toe board that scales for 320px phone and 1440px desktop, with ≥48px cells.” Add media queries for 5x5.
- **Click Handler**: In `script.js`, prompt: “Generate a click handler for a Tic-Tac-Toe grid cell that places X or O and updates the game state.” Ensure it checks for empty cells.

**Tips**:
- Break logic into small functions (e.g., `makeMove`, `checkWin`, `switchPlayer`).
- Test win detection with edge cases (e.g., diagonal three-in-a-row).
- Use DevTools to simulate touch events on mobile view.

### Milestone 3: Online Gameplay Logic (~5-6 hours)
**Your Tasks**:
1. **Set Up Firebase Rooms**:
   - In `firebase.js`, add functions to create/join rooms and sync moves.
   - Store minimal data: room ID, grid state, current turn, player symbols.
2. **Integrate with Frontend**:
   - Update `script.js` to handle online mode, using Firebase listeners for updates.
   - Test room creation and joining with two browser tabs.
3. **Optimize for Free Tier**:
   - Ensure each move writes <100 bytes (e.g., `{ row: 1, col: 2, symbol: "X" }`).
   - Close rooms after games to free connections.
4. **Commit Changes**: `git add .`, `git commit -m "Online gameplay"`, `git push`.

**Cursor Prompts**:
- **Room Creation**: In `firebase.js`, prompt: “Generate Firebase code to create a unique room with a 6-character alphanumeric code and store a 4x4 Tic-Tac-Toe grid state.” Verify code generation.
- **Move Sync**: Prompt: “Write Firebase code to sync a Tic-Tac-Toe move (row, col, symbol) between two players in a room, using <100 bytes per write.” Test with console logs.
- **Join Room**: Prompt: “Generate code to join a Firebase room by code and get the current game state.” Ensure it handles invalid codes.
- **Turn Enforcement**: In `script.js`, prompt: “Update my Tic-Tac-Toe game to disable moves until Firebase confirms it’s the player’s turn.” Check for “Waiting for opponent” message.

**Tips**:
- Test with two browsers side-by-side to simulate remote play.
- Monitor Firebase Console (Database > Usage) to confirm low data usage.
- If desync occurs, debug with: “Why is my Firebase listener updating the grid incorrectly?”

### Milestone 4: Responsive UI Implementation (~3-4 hours)
**Your Tasks**:
1. **Style Landing Page**:
   - Update `index.html` and `styles.css` for offline/online buttons and instructions.
   - Add “Play for Free” text and “How to Play” section.
2. **Add Online UI**:
   - Create room code display, input field, and “Copy Invite” button.
   - Test copying the GitHub Pages URL + code.
3. **Test Responsiveness**:
   - Use DevTools to test 320px (phone), 768px (tablet), and 1440px (desktop).
   - Verify touch/click works for all interactions.
4. **Commit Changes**: `git add .`, `git commit -m "Responsive UI"`, `git push`.

**Cursor Prompts**:
- **Landing Page**: In `index.html`, prompt: “Generate HTML for a responsive Tic-Tac-Toe landing page with ‘Play Offline,’ ‘Play Online,’ and ‘How to Play’ sections, emphasizing free play.” Add CSS prompt: “Style this landing page for phone and desktop with centered buttons.”
- **Online UI**: In `index.html`, prompt: “Create a form for joining a Tic-Tac-Toe room with a code input and ‘Join’ button, plus a ‘Copy Invite’ button for the room code.” In `script.js`, prompt: “Add Clipboard API code to copy a URL and room code when clicking ‘Copy Invite’.”
- **Responsive Fixes**: If layout breaks, prompt: “Fix this CSS to make my 4x4 grid fit on a 320px phone screen without scrolling.” Test media queries.

**Tips**:
- Ensure buttons are ≥48px for touch accessibility.
- Test “Copy Invite” by pasting the result in a text editor.
- Simplify animations to avoid performance issues on phones.

### Milestone 5: Grid Size Selection (~1 hour)
**Your Tasks**:
1. **Add Grid Selection**:
   - Update `index.html` with a dropdown for 4x4/5x5 before starting.
   - Modify `script.js` to initialize the grid dynamically.
2. **Sync in Online Mode**:
   - Ensure host’s grid choice syncs to opponent via Firebase.
3. **Test Both Sizes**: Play games in both modes to confirm functionality.
4. **Commit Changes**: `git add .`, `git commit -m "Grid selection"`, `git push`.

**Cursor Prompts**:
- **Grid Selection**: In `index.html`, prompt: “Add a dropdown to choose 4x4 or 5x5 grid before starting a Tic-Tac-Toe game.” In `script.js`, prompt: “Update my game logic to initialize a 4x4 or 5x5 grid based on a dropdown value.”
- **Online Sync**: In `firebase.js`, prompt: “Modify my Firebase room code to store and sync the grid size (4x4 or 5x5) chosen by the host.” Verify opponent sees the correct grid.

**Tips**:
- Default to 4x4 if no selection is made.
- Test win detection for 5x5 diagonals specifically.

### Milestone 6: Testing and Polish (~3-4 hours)
**Your Tasks**:
1. **Test Gameplay**:
   - Play multiple games in offline and online modes, checking win/loss/draw.
   - Simulate disconnections by closing a browser tab in online mode.
2. **Verify Free Tier**:
   - In Firebase Console, check Database > Usage after 10 test games to ensure <1 MB transfer.
   - Confirm GitHub Pages loads fast (<2 seconds) in DevTools’ Network tab.
3. **Polish UI**:
   - Add error messages for invalid codes or network issues.
   - Tweak fonts/colors for readability if needed.
4. **Commit Changes**: `git add .`, `git commit -m "Testing and polish"`, `git push`.

**Cursor Prompts**:
- **Error Handling**: In `script.js`, prompt: “Add error messages for invalid Firebase room codes and opponent disconnections.” Test with a wrong code.
- **Optimization**: In `firebase.js`, prompt: “Optimize my Firebase writes to use <100 bytes per Tic-Tac-Toe move.” Check payload size in Firebase logs.
- **UI Polish**: In `styles.css`, prompt: “Improve my game board’s contrast and font size for better readability on phones.” Verify with DevTools’ accessibility tools.

**Tips**:
- Use DevTools’ Lighthouse to check performance and accessibility scores.
- If Firebase usage seems high, debug with: “Why is my Firebase data transfer exceeding 1 MB?”
- Keep changes minimal to avoid scope creep.

### Milestone 7: Final Review and Deployment (~2 hours)
**Your Tasks**:
1. **Deploy Final Version**:
   - Push all changes to GitHub: `git add .`, `git commit -m "Final deployment"`, `git push`.
   - Verify the game loads at `username.github.io/reverse-tic-tac-toe`.
2. **Test Sharing**:
   - Create a room, copy the invite, and join from another device/browser.
   - Confirm offline mode works without internet (disable Wi-Fi temporarily).
3. **Secure Firebase** (Optional):
   - In Firebase Console, update Database Rules to limit access (e.g., only allow writes from connected players).
4. **Document Setup**:
   - Create a `README.md` with setup and sharing instructions.

**Cursor Prompts**:
- **Final Deployment**: Prompt: “Show me how to deploy my HTML/CSS/JS game to GitHub Pages from a GitHub repository.” Follow steps if unsure.
- **Firebase Security**: Prompt: “Generate Firebase Realtime Database rules to allow only authenticated room players to write game state.” Apply in Firebase Console.
- **README**: In `README.md`, prompt: “Write a README for a Tic-Tac-Toe game hosted on GitHub Pages with Firebase, explaining how to share and play.” Tweak for your project.

**Tips**:
- Share the URL with a friend to test real-world playability.
- Check Firebase usage one last time to confirm free-tier compliance.
- If errors occur, debug with: “Why is my GitHub Pages site not loading my game?”

---

## Additional Notes
- **Monitoring Free Tier**:
  - Firebase: Check `console.firebase.google.com > Database > Usage` weekly to ensure <10 GB transfer and <100 connections.
  - GitHub Pages: Usage is rarely an issue, but confirm the site loads in GitHub’s Pages settings.
- **Handling Cursor Suggestions**:
  - If Cursor suggests overly complex code (e.g., React), re-prompt with: “Rewrite this using only Vanilla JS for a simple Tic-Tac-Toe game.”
  - Use `Ctrl+Enter` to accept small chunks and review before committing.
  - For bugs, describe the issue clearly: “My grid isn’t updating after a Firebase move; fix this code.”
- **Time Management**:
  - Spread tasks over 1-2 weeks, focusing on one milestone per session.
  - Use Cursor’s speed to cut coding time, but manually test gameplay to catch logic errors.
- **Sharing the Game**:
  - After deployment, share the GitHub Pages URL (e.g., `username.github.io/reverse-tic-tac-toe`) and a room code for online play.
  - For offline mode, just share the URL and instruct players to click “Play Offline.”

---

## Conclusion
The updated PRD fully defines Reverse Tic-Tac-Toe with offline and online modes, hosted for free on GitHub Pages and Firebase’s Spark Plan. It ensures players can access the game without cost, using only a browser and, for online mode, a shared room code. The responsive design guarantees playability on phone and desktop, making it easy to share and play. The Cursor instructions guide you through each development step, leveraging AI to build efficiently while staying within free-tier limits.

