# Reverse Tic-Tac-Toe

A free-to-play, web-based implementation of Reverse Tic-Tac-Toe with both offline and online gameplay modes. Hosted for free on GitHub Pages and Firebase.

## About the Game

Reverse Tic-Tac-Toe is the opposite of regular Tic-Tac-Toe:
- Players take turns placing their symbol (X or O) on a 4x4 or 5x5 grid
- The objective is to force your opponent to get three of their symbols in a row (horizontal, vertical, or diagonal)
- If you get three of your symbols in a row, you lose!

## Features

- **Two Game Modes**:
  - **Offline Mode**: Play locally with a friend on the same device
  - **Online Mode**: Play remotely with a friend by sharing a unique room code
- **Customizable Grid Size**: Choose between 4x4 and 5x5 grids
- **Responsive Design**: Works on both mobile and desktop devices
- **Zero Cost**: Play for free, no accounts or payments required

## Play Online

Visit [https://username.github.io/reverse-tic-tac-toe](https://username.github.io/reverse-tic-tac-toe) to play the game. Simply choose a mode:
- **Offline Mode**: Click "Play Offline" to start playing locally
- **Online Mode**: Click "Play Online" and either:
  - Create a room and share the room code with a friend
  - Join a room by entering a room code shared with you

## Local Development Setup

### Prerequisites
- Git
- A modern web browser
- A Firebase account (for online mode)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/username/reverse-tic-tac-toe.git
   cd reverse-tic-tac-toe
   ```

2. Set up Firebase (for online mode):
   - Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Realtime Database (create in test mode initially)
   - Register a web app in your Firebase project
   - Copy the Firebase configuration object
   - Replace the placeholder config in `firebase.js` with your actual configuration

3. Run the game:
   - Open `index.html` in your browser, or
   - Use a local server (e.g., with the Live Server VS Code extension)

### Deployment
1. Push your code to GitHub
2. Set up GitHub Pages in your repository settings to deploy from the main branch
3. Access your game at `https://username.github.io/reverse-tic-tac-toe`

## Firebase Security Rules

For production deployment, update your Firebase Realtime Database rules to limit connections and prevent abuse:

```json
{
  "rules": {
    "rooms": {
      ".read": true,
      ".write": true,
      "$roomId": {
        ".validate": "newData.hasChildren(['board', 'currentTurn', 'players', 'gridSize'])",
        "board": { ".validate": true },
        "currentTurn": { ".validate": "newData.isString() && (newData.val() === 'x' || newData.val() === 'o')" },
        "players": { ".validate": true },
        "gameActive": { ".validate": "newData.isBoolean()" },
        "gridSize": { ".validate": "newData.isNumber() && (newData.val() === 4 || newData.val() === 5)" },
        "winner": { ".validate": "newData.isString() || newData.val() === null" },
        "draw": { ".validate": "newData.isBoolean() || newData.val() === null" },
        "restartRequested": { ".validate": true },
        "lastUpdated": { ".validate": true }
      }
    }
  }
}
```

## Technologies Used

- HTML5, CSS3, and JavaScript (Vanilla JS)
- Firebase Realtime Database (Spark Plan - free tier)
- GitHub Pages for hosting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- This project was built following the PRD created for a Reverse Tic-Tac-Toe game
- Developed using Cursor for AI-assisted coding 