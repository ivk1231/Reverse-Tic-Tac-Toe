// DOM Elements
const landingPage = document.getElementById('landing-page');
const offlineGame = document.getElementById('offline-game');
const onlineLobby = document.getElementById('online-lobby');
const onlineGame = document.getElementById('online-game');

const gridSizeSelect = document.getElementById('grid-size');
const playOfflineBtn = document.getElementById('play-offline-btn');
const playOnlineBtn = document.getElementById('play-online-btn');

const offlineBoard = document.getElementById('offline-board');
const offlineTurnInfo = document.getElementById('offline-turn-info');
const offlineRestartBtn = document.getElementById('offline-restart');
const offlineBackBtn = document.getElementById('offline-back');

const createRoomBtn = document.getElementById('create-room-btn');
const roomCreated = document.getElementById('room-created');
const roomCodeSpan = document.getElementById('room-code');
const copyInviteBtn = document.getElementById('copy-invite');
const waitingMessage = document.getElementById('waiting-message');

const roomCodeInput = document.getElementById('room-code-input');
const joinRoomBtn = document.getElementById('join-room-btn');
const joinError = document.getElementById('join-error');
const onlineBackBtn = document.getElementById('online-back');

const onlineBoard = document.getElementById('online-board');
const displayRoomCode = document.getElementById('display-room-code');
const onlineTurnInfo = document.getElementById('online-turn-info');
const connectionStatus = document.getElementById('connection-status');
const onlineRestartBtn = document.getElementById('online-restart');
const exitRoomBtn = document.getElementById('exit-room');

// Game state variables
let gridSize = 4; // Default grid size
let offlineGameBoard = [];
let currentPlayer = 'x';
let gameActive = false;
let onlineGameData = null;
let playerSymbol = '';
let roomId = '';
let roomRef = null;

// Initialize the game
function init() {
    // Set event listeners
    playOfflineBtn.addEventListener('click', startOfflineGame);
    playOnlineBtn.addEventListener('click', showOnlineLobby);
    offlineRestartBtn.addEventListener('click', restartOfflineGame);
    offlineBackBtn.addEventListener('click', goToLandingPage);
    onlineBackBtn.addEventListener('click', goToLandingPage);
    
    createRoomBtn.addEventListener('click', createRoom);
    copyInviteBtn.addEventListener('click', copyInvite);
    joinRoomBtn.addEventListener('click', joinRoom);
    exitRoomBtn.addEventListener('click', exitRoom);
    onlineRestartBtn.addEventListener('click', requestRestartOnlineGame);
    
    gridSizeSelect.addEventListener('change', function() {
        gridSize = parseInt(gridSizeSelect.value);
    });
}

// Navigation functions
function showOnlineLobby() {
    landingPage.classList.add('hidden');
    onlineLobby.classList.remove('hidden');
}

function goToLandingPage() {
    // Hide all other sections
    offlineGame.classList.add('hidden');
    onlineLobby.classList.add('hidden');
    onlineGame.classList.add('hidden');
    
    // Cleanup if needed
    if (roomRef) {
        leaveRoom();
    }
    
    // Show landing page
    landingPage.classList.remove('hidden');
}

// Offline Game Functions
function startOfflineGame() {
    landingPage.classList.add('hidden');
    offlineGame.classList.remove('hidden');
    
    // Set up the game board
    gridSize = parseInt(gridSizeSelect.value);
    createOfflineGameBoard();
    
    // Initialize game state
    currentPlayer = 'x';
    gameActive = true;
    updateOfflineTurnInfo();
}

function createOfflineGameBoard() {
    // Reset the board array
    offlineGameBoard = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
    
    // Clear any existing board
    offlineBoard.innerHTML = '';
    
    // Set the board class based on grid size
    offlineBoard.className = 'board size-' + gridSize;
    
    // Create cells
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleOfflineCellClick);
            offlineBoard.appendChild(cell);
        }
    }
}

function handleOfflineCellClick(e) {
    if (!gameActive) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // Check if the cell is already filled
    if (offlineGameBoard[row][col] !== '') return;
    
    // Update the board array and UI
    offlineGameBoard[row][col] = currentPlayer;
    e.target.textContent = currentPlayer.toUpperCase();
    e.target.classList.add(currentPlayer);
    
    // Check for a winner (in Reverse Tic-Tac-Toe, three in a row loses)
    if (checkWin(offlineGameBoard, currentPlayer, 3)) {
        gameActive = false;
        offlineTurnInfo.textContent = `Player ${currentPlayer.toUpperCase()} Loses!`;
        highlightWinningCells(offlineBoard, offlineGameBoard, currentPlayer);
        return;
    }
    
    // Check for a draw
    if (checkDraw(offlineGameBoard)) {
        gameActive = false;
        offlineTurnInfo.textContent = "It's a Draw!";
        return;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    updateOfflineTurnInfo();
}

function updateOfflineTurnInfo() {
    offlineTurnInfo.textContent = `Player ${currentPlayer.toUpperCase()}'s Turn`;
}

function restartOfflineGame() {
    createOfflineGameBoard();
    currentPlayer = 'x';
    gameActive = true;
    updateOfflineTurnInfo();
}

// Online Game Functions
function createRoom() {
    gridSize = parseInt(gridSizeSelect.value);
    roomId = generateRoomCode();
    playerSymbol = 'x';  // Host is always X
    
    // Create a new room in Firebase
    roomRef = firebase.database().ref('rooms/' + roomId);
    
    const initialGameState = {
        gridSize: gridSize,
        board: Array(gridSize).fill().map(() => Array(gridSize).fill('')),
        currentTurn: 'x',
        players: { 'x': true },
        gameActive: true,
        restartRequested: { 'x': false, 'o': false }
    };
    
    roomRef.set(initialGameState)
        .then(() => {
            roomCodeSpan.textContent = roomId;
            roomCreated.classList.remove('hidden');
            
            // Listen for opponent joining
            listenForOpponent();
            
            // Listen for game state changes
            listenForGameStateChanges();
        })
        .catch(error => {
            console.error("Error creating room:", error);
            connectionStatus.textContent = "Error creating room. Please try again.";
        });
}

function joinRoom() {
    const code = roomCodeInput.value.toUpperCase();
    
    if (code.length !== 6) {
        joinError.classList.remove('hidden');
        joinError.textContent = "Room code must be 6 characters.";
        return;
    }
    
    // Check if room exists
    const roomRef = firebase.database().ref('rooms/' + code);
    roomRef.once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                joinError.classList.remove('hidden');
                joinError.textContent = "Room not found. Please check the code.";
                return;
            }
            
            const data = snapshot.val();
            // Check if room already has 2 players
            if (data.players && data.players.o) {
                joinError.classList.remove('hidden');
                joinError.textContent = "Room is full.";
                return;
            }
            
            // Join the room
            playerSymbol = 'o';  // Second player is always O
            roomId = code;
            
            // Update room data to include the second player
            return roomRef.child('players').update({ 'o': true })
                .then(() => {
                    // Hide lobby, show game
                    onlineLobby.classList.add('hidden');
                    onlineGame.classList.remove('hidden');
                    
                    // Update UI
                    displayRoomCode.textContent = code;
                    
                    // Set up game board
                    this.roomRef = roomRef;
                    
                    // Listen for game state changes
                    listenForGameStateChanges();
                    
                    // Create the board UI
                    createOnlineGameBoard(data.gridSize);
                });
        })
        .catch(error => {
            console.error("Error joining room:", error);
            joinError.classList.remove('hidden');
            joinError.textContent = "Error joining room. Please try again.";
        });
}

function listenForOpponent() {
    const playersRef = roomRef.child('players');
    
    playersRef.on('value', snapshot => {
        const players = snapshot.val();
        
        if (players && players.o) {
            // Opponent joined, start the game
            waitingMessage.textContent = "Opponent joined! Game starting...";
            
            // Hide lobby, show game after a short delay
            setTimeout(() => {
                onlineLobby.classList.add('hidden');
                onlineGame.classList.remove('hidden');
                
                // Update UI
                displayRoomCode.textContent = roomId;
                
                // Create the board UI
                createOnlineGameBoard(gridSize);
            }, 1000);
        }
    });
}

function listenForGameStateChanges() {
    if (!roomRef) return;
    
    roomRef.on('value', snapshot => {
        const data = snapshot.val();
        if (!data) return;
        
        onlineGameData = data;
        
        // Update the board UI
        updateOnlineGameBoard(data.board);
        
        // Update turn info
        if (data.gameActive) {
            if (data.currentTurn === playerSymbol) {
                onlineTurnInfo.textContent = "Your Turn";
            } else {
                onlineTurnInfo.textContent = "Opponent's Turn";
            }
        }
        
        // Check win/draw conditions
        if (data.winner) {
            if (data.winner === playerSymbol) {
                onlineTurnInfo.textContent = "You Lose!";
            } else {
                onlineTurnInfo.textContent = "You Win!";
            }
            highlightWinningCells(onlineBoard, data.board, data.winner);
        } else if (data.draw) {
            onlineTurnInfo.textContent = "It's a Draw!";
        }
        
        // Check for restart requests
        if (data.restartRequested) {
            const otherPlayer = playerSymbol === 'x' ? 'o' : 'x';
            
            if (data.restartRequested[otherPlayer]) {
                onlineRestartBtn.textContent = "Confirm Restart";
            } else {
                onlineRestartBtn.textContent = "Restart Game";
            }
            
            // If both players requested restart
            if (data.restartRequested.x && data.restartRequested.o) {
                // Reset restart requests
                roomRef.child('restartRequested').set({
                    x: false,
                    o: false
                });
                
                // Reset the game
                const freshBoard = Array(data.gridSize).fill().map(() => Array(data.gridSize).fill(''));
                roomRef.update({
                    board: freshBoard,
                    currentTurn: 'x',
                    gameActive: true,
                    winner: null,
                    draw: false
                });
                
                onlineRestartBtn.textContent = "Restart Game";
            }
        }
        
        // Check if the other player disconnected
        const otherPlayer = playerSymbol === 'x' ? 'o' : 'x';
        if (!data.players || !data.players[otherPlayer]) {
            connectionStatus.textContent = "Opponent disconnected.";
        } else {
            connectionStatus.textContent = "";
        }
    });
}

function createOnlineGameBoard(size) {
    // Clear any existing board
    onlineBoard.innerHTML = '';
    
    // Set the board class based on grid size
    onlineBoard.className = 'board size-' + size;
    
    // Create cells
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleOnlineCellClick);
            onlineBoard.appendChild(cell);
        }
    }
}

function updateOnlineGameBoard(board) {
    if (!board) return;
    
    // Update each cell in the UI
    const cells = onlineBoard.querySelectorAll('.cell');
    
    board.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            const index = rowIndex * board.length + colIndex;
            const cell = cells[index];
            
            // Clear existing classes
            cell.classList.remove('x', 'o');
            
            // Update cell content
            if (value) {
                cell.textContent = value.toUpperCase();
                cell.classList.add(value);
            } else {
                cell.textContent = '';
            }
        });
    });
}

function handleOnlineCellClick(e) {
    if (!onlineGameData || !onlineGameData.gameActive) return;
    if (onlineGameData.currentTurn !== playerSymbol) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // Check if the cell is already filled
    if (onlineGameData.board[row][col] !== '') return;
    
    // Create a deep copy of the board
    const updatedBoard = JSON.parse(JSON.stringify(onlineGameData.board));
    updatedBoard[row][col] = playerSymbol;
    
    // Check for win/draw
    let updates = {
        board: updatedBoard,
        currentTurn: playerSymbol === 'x' ? 'o' : 'x'
    };
    
    // Check for a win (in Reverse Tic-Tac-Toe, three in a row loses)
    if (checkWin(updatedBoard, playerSymbol, 3)) {
        updates.gameActive = false;
        updates.winner = playerSymbol;
    } else if (checkDraw(updatedBoard)) {
        updates.gameActive = false;
        updates.draw = true;
    }
    
    // Update the game state in Firebase
    roomRef.update(updates)
        .catch(error => {
            console.error("Error updating game state:", error);
        });
}

function requestRestartOnlineGame() {
    if (!roomRef) return;
    
    // Update restart request for this player
    roomRef.child('restartRequested/' + playerSymbol).set(true)
        .catch(error => {
            console.error("Error requesting restart:", error);
        });
}

function exitRoom() {
    leaveRoom();
    onlineGame.classList.add('hidden');
    landingPage.classList.remove('hidden');
}

function leaveRoom() {
    if (!roomRef) return;
    
    // Remove the player from the room
    if (playerSymbol) {
        roomRef.child('players/' + playerSymbol).remove();
    }
    
    // Unsubscribe from Firebase listeners
    roomRef.off();
    roomRef = null;
    roomId = '';
    playerSymbol = '';
}

function copyInvite() {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const url = `${origin}${path}?room=${roomId}`;
    
    const textToCopy = `Join my Reverse Tic-Tac-Toe game! URL: ${url} Room Code: ${roomId}`;
    
    // Use the Clipboard API
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            copyInviteBtn.textContent = "Copied!";
            setTimeout(() => {
                copyInviteBtn.textContent = "Copy Invite";
            }, 2000);
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            copyInviteBtn.textContent = "Copied!";
            setTimeout(() => {
                copyInviteBtn.textContent = "Copy Invite";
            }, 2000);
        });
}

// Utility Functions
function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function checkWin(board, player, lineLength) {
    // Check horizontal
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col <= board.length - lineLength; col++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row][col + i] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) return true;
        }
    }
    
    // Check vertical
    for (let col = 0; col < board.length; col++) {
        for (let row = 0; row <= board.length - lineLength; row++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row + i][col] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) return true;
        }
    }
    
    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row <= board.length - lineLength; row++) {
        for (let col = 0; col <= board.length - lineLength; col++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row + i][col + i] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) return true;
        }
    }
    
    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row <= board.length - lineLength; row++) {
        for (let col = lineLength - 1; col < board.length; col++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row + i][col - i] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) return true;
        }
    }
    
    return false;
}

function checkDraw(board) {
    // Check if the board is full
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board.length; col++) {
            if (board[row][col] === '') {
                return false;
            }
        }
    }
    return true;
}

function highlightWinningCells(boardElement, boardData, player) {
    const cells = boardElement.querySelectorAll('.cell');
    const lineLength = 3;
    
    // Helper to highlight cells
    const highlightCells = (indices) => {
        indices.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
    };
    
    // Check horizontal
    for (let row = 0; row < boardData.length; row++) {
        for (let col = 0; col <= boardData.length - lineLength; col++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (boardData[row][col + i] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) {
                const indices = [];
                for (let i = 0; i < lineLength; i++) {
                    indices.push(row * boardData.length + (col + i));
                }
                highlightCells(indices);
                return;
            }
        }
    }
    
    // Check vertical
    for (let col = 0; col < boardData.length; col++) {
        for (let row = 0; row <= boardData.length - lineLength; row++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (boardData[row + i][col] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) {
                const indices = [];
                for (let i = 0; i < lineLength; i++) {
                    indices.push((row + i) * boardData.length + col);
                }
                highlightCells(indices);
                return;
            }
        }
    }
    
    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row <= boardData.length - lineLength; row++) {
        for (let col = 0; col <= boardData.length - lineLength; col++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (boardData[row + i][col + i] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) {
                const indices = [];
                for (let i = 0; i < lineLength; i++) {
                    indices.push((row + i) * boardData.length + (col + i));
                }
                highlightCells(indices);
                return;
            }
        }
    }
    
    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row <= boardData.length - lineLength; row++) {
        for (let col = lineLength - 1; col < boardData.length; col++) {
            let line = true;
            for (let i = 0; i < lineLength; i++) {
                if (boardData[row + i][col - i] !== player) {
                    line = false;
                    break;
                }
            }
            if (line) {
                const indices = [];
                for (let i = 0; i < lineLength; i++) {
                    indices.push((row + i) * boardData.length + (col - i));
                }
                highlightCells(indices);
                return;
            }
        }
    }
}

// Check for room code in URL when the page loads
window.onload = function() {
    init();
    
    // Check for room code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    
    if (roomParam) {
        playOnlineBtn.click();
        roomCodeInput.value = roomParam;
    }
}; 