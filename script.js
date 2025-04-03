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

// AI mode elements
const symbolSelection = document.getElementById('symbolSelection');
const playerSymbolSelect = document.getElementById('playerSymbol');
const modeRadios = document.querySelectorAll('input[name="offlineMode"]');

// Game state variables
let gridSize = 4; // Default grid size
let offlineGameBoard = [];
let currentPlayer = 'x';
let gameActive = false;
let onlineGameData = null;
let playerSymbol = 'x'; // Default player symbol
let aiSymbol = 'o';     // Default AI symbol
let gameMode = 'twoPlayers'; // Default game mode
let roomId = '';
let roomRef = null;
let aiThinking = false; // Flag to prevent clicks during AI turn

// Undo feature variables
let undoEnabled = false; // Always disabled
let xUndoAvailable = false; // No undo available
let oUndoAvailable = false; // No undo available
let lastMove = null; // Store the last move for undo functionality
let undoMode = false; // Flag to indicate when in undo mode (selecting a new position)
let undoSourceCell = null; // Stores the cell being moved during undo

// Check if Firebase is initialized and connected
function isFirebaseConnected() {
    return typeof firebase !== 'undefined' && firebase && firebase.apps && firebase.apps.length > 0;
}

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
    
    // Set up mode selection and symbol selection
    modeRadios.forEach(radio => {
        radio.addEventListener('change', handleModeChange);
    });
    
    playerSymbolSelect.addEventListener('change', function() {
        playerSymbol = playerSymbolSelect.value;
        aiSymbol = playerSymbol === 'x' ? 'o' : 'x';
    });
}

// Handle game mode change
function handleModeChange() {
    gameMode = document.querySelector('input[name="offlineMode"]:checked').value;
    
    if (gameMode === 'ai') {
        // Enable the symbol selection
        symbolSelection.classList.remove('disabled');
        playerSymbolSelect.disabled = false;
    } else {
        // Disable the symbol selection
        symbolSelection.classList.add('disabled');
        playerSymbolSelect.disabled = true;
    }
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
    
    // Get the game mode and player symbol
    gameMode = document.querySelector('input[name="offlineMode"]:checked').value;
    undoEnabled = false; // Always disable undo
    
    if (gameMode === 'ai') {
        playerSymbol = playerSymbolSelect.value;
        aiSymbol = playerSymbol === 'x' ? 'o' : 'x';
        
        // Randomly determine who goes first in AI mode
        const randomFirstPlayer = Math.random() < 0.5 ? 'x' : 'o';
        currentPlayer = randomFirstPlayer;
        
        // Update turn info based on who goes first
        if (currentPlayer === playerSymbol) {
            offlineTurnInfo.textContent = "Your Turn";
        } else {
            offlineTurnInfo.textContent = "AI's Turn";
        }
    } else {
        // For two-player mode, X always goes first
        currentPlayer = 'x';
        offlineTurnInfo.textContent = "Player 1's Turn (X)";
    }
    
    // Set up the game board
    gridSize = parseInt(gridSizeSelect.value);
    createOfflineGameBoard();
    
    // Initialize game state
    gameActive = true;
    xUndoAvailable = false; // No undo available
    oUndoAvailable = false; // No undo available
    lastMove = null;
    undoMode = false;
    undoSourceCell = null;
    
    // If AI goes first, make the first move
    if (gameMode === 'ai' && currentPlayer === aiSymbol) {
        makeAIMove();
    }
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
    if (!gameActive || aiThinking) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    console.log("Cell clicked at:", row, col, "UndoMode:", undoMode, "Current player:", currentPlayer);
    
    // If we're in undo mode (selecting where to place a removed symbol)
    if (undoMode) {
        // Make sure the target cell is empty
        if (offlineGameBoard[row][col] !== '') return;
        
        // Place the symbol in the new location
        offlineGameBoard[row][col] = currentPlayer;
        e.target.textContent = currentPlayer.toUpperCase();
        e.target.classList.add(currentPlayer);
        
        // Exit undo mode
        undoMode = false;
        
        // Update turn info and check game state
        checkGameStateAfterMove(row, col);
        return;
    }
    
    // Regular move handling
    // Check if the cell is already filled
    if (offlineGameBoard[row][col] !== '') return;
    
    // Check if it's AI mode and not the player's turn
    if (gameMode === 'ai' && currentPlayer !== playerSymbol) return;
    
    // Update the board array and UI
    offlineGameBoard[row][col] = currentPlayer;
    e.target.textContent = currentPlayer.toUpperCase();
    e.target.classList.add(currentPlayer);
    
    // Store the last move for undo
    lastMove = { row, col, player: currentPlayer };
    console.log("Stored last move:", lastMove);
    
    // Check game state after the move
    checkGameStateAfterMove(row, col);
}

function makeAIMove() {
    // Show AI thinking
    aiThinking = true;
    offlineTurnInfo.textContent = "AI is thinking...";
    
    // Add a slight delay to show "AI is thinking"
    setTimeout(() => {
        if (!gameActive) {
            aiThinking = false;
            return;
        }
        
        // Get the AI move
        const [row, col] = aiMove(offlineGameBoard, playerSymbol, aiSymbol);
        
        // Get the cell at the AI move coordinates
        const cells = offlineBoard.querySelectorAll('.cell');
        const cellIndex = row * gridSize + col;
        const cell = cells[cellIndex];
        
        // Update the board array and UI
        offlineGameBoard[row][col] = aiSymbol;
        cell.textContent = aiSymbol.toUpperCase();
        cell.classList.add(aiSymbol);
        
        // Check for a winner (in Reverse Tic-Tac-Toe, three in a row loses)
        if (checkWin(offlineGameBoard, aiSymbol, 3)) {
            gameActive = false;
            offlineTurnInfo.textContent = `AI Loses!`;
            highlightWinningCells(offlineBoard, offlineGameBoard, aiSymbol);
            aiThinking = false;
            return;
        }
        
        // Check for a draw
        if (checkDraw(offlineGameBoard)) {
            gameActive = false;
            offlineTurnInfo.textContent = "It's a Draw!";
            aiThinking = false;
            return;
        }
        
        // Switch to player's turn
        currentPlayer = playerSymbol;
        updateOfflineTurnInfo();
        aiThinking = false;
    }, 500); // Add a 500ms delay for "AI thinking" effect
}

function updateOfflineTurnInfo() {
    if (gameMode === 'ai') {
        if (currentPlayer === playerSymbol) {
            offlineTurnInfo.textContent = "Your Turn";
        } else {
            offlineTurnInfo.textContent = "AI's Turn";
        }
    } else {
        // For two-player mode, add clarity about which player is which symbol
        if (currentPlayer === 'x') {
            offlineTurnInfo.textContent = "Player 1's Turn (X)";
        } else {
            offlineTurnInfo.textContent = "Player 2's Turn (O)";
        }
    }
}

function restartOfflineGame() {
    createOfflineGameBoard();
    gameActive = true;
    
    if (gameMode === 'ai') {
        // Randomly determine who goes first in AI mode
        const randomFirstPlayer = Math.random() < 0.5 ? 'x' : 'o';
        currentPlayer = randomFirstPlayer;
        
        // Update turn info based on who goes first
        if (currentPlayer === playerSymbol) {
            offlineTurnInfo.textContent = "Your Turn";
        } else {
            offlineTurnInfo.textContent = "AI's Turn";
        }
        
        // If AI goes first, make AI move
        if (currentPlayer === aiSymbol) {
            makeAIMove();
        }
    } else {
        // For two-player mode, X always goes first
        currentPlayer = 'x';
        offlineTurnInfo.textContent = "Player 1's Turn (X)";
    }
}

// Helper function to check game state after a move
function checkGameStateAfterMove(row, col) {
    // Check for a winner (in Reverse Tic-Tac-Toe, three in a row loses)
    if (checkWin(offlineGameBoard, currentPlayer, 3)) {
        gameActive = false;
        
        if (gameMode === 'ai') {
            if (currentPlayer === playerSymbol) {
                offlineTurnInfo.textContent = "You Lose!";
            } else {
                offlineTurnInfo.textContent = "AI Loses!";
            }
        } else {
            // For two-player mode
            if (currentPlayer === 'x') {
                offlineTurnInfo.textContent = "Player 1 (X) Loses!";
            } else {
                offlineTurnInfo.textContent = "Player 2 (O) Loses!";
            }
        }
        
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
    
    // If it's AI mode and AI's turn, make the AI move
    if (gameMode === 'ai' && currentPlayer === aiSymbol && gameActive) {
        makeAIMove();
    }
}

// Online Game Functions
function createRoom() {
    console.log("createRoom function called");
    
    // Check if Firebase is initialized
    if (typeof firebase === 'undefined') {
        console.error("Firebase is not defined - script might not be loaded");
        alert("Cannot connect to Firebase: Firebase scripts not loaded. Please refresh the page and try again.");
        return;
    }
    
    if (!firebase.apps || firebase.apps.length === 0) {
        console.error("Firebase apps array is empty - Firebase not initialized properly");
        alert("Cannot connect to Firebase: Initialization failed. Please refresh the page and try again.");
        return;
    }
    
    try {
        // Test if we can access the database
        const testRef = firebase.database();
        if (!testRef) {
            throw new Error("Database reference is null or undefined");
        }
        console.log("Firebase database access confirmed");
    } catch (dbError) {
        console.error("Firebase database access error:", dbError);
        alert("Cannot connect to Firebase database. Online mode is unavailable: " + dbError.message);
        return;
    }
    
    console.log("Firebase connection verified");
    
    gridSize = parseInt(gridSizeSelect.value);
    roomId = generateRoomCode();
    playerSymbol = 'x';  // Host is always X
    
    console.log("Generated room code:", roomId);
    
    // Create a new room in Firebase
    try {
        roomRef = firebase.database().ref('rooms/' + roomId);
        console.log("Room reference created:", roomId);
        
        // Show "Creating room..." feedback
        connectionStatus.textContent = "Creating room...";
        
        // Randomly determine which player goes first (x or o)
        const firstPlayer = Math.random() < 0.5 ? 'x' : 'o';
        console.log(`Random first player selected: ${firstPlayer}`);
        
        const initialGameState = {
            gridSize: gridSize,
            board: Array(gridSize).fill().map(() => Array(gridSize).fill('')),
            currentTurn: firstPlayer, // Randomly assigned first player
            players: { 'x': true },
            gameActive: true,
            restartRequested: { 'x': false, 'o': false },
            undoEnabled: false, // Always disable undo
            undoAvailable: { 'x': false, 'o': false },
            undoMode: false,
            lastMove: null,
            lastUpdated: Date.now() // Add timestamp
        };
        
        console.log("Initial game state created:", initialGameState);
        console.log("Attempting to set data in Firebase...");
        
        // Set a timeout to detect if Firebase operation is hanging
        let firebaseOperationCompleted = false;
        const timeoutId = setTimeout(() => {
            if (!firebaseOperationCompleted) {
                console.error("Firebase operation timed out after 10 seconds");
                alert("Connection to Firebase timed out. Check your internet connection and try again.");
                connectionStatus.textContent = "Room creation timed out. Please try again.";
            }
        }, 10000);
        
        roomRef.set(initialGameState)
            .then(() => {
                firebaseOperationCompleted = true;
                clearTimeout(timeoutId);
                
                console.log("Room created successfully in Firebase");
                connectionStatus.textContent = "";
                
                // Test if we can read back the data
                return roomRef.once('value');
            })
            .then((snapshot) => {
                if (snapshot && snapshot.exists()) {
                    console.log("Room data verification success:", snapshot.val());
                    
                    // Only proceed to next UI state if all checks pass
                    roomCodeSpan.textContent = roomId;
                    roomCreated.classList.remove('hidden');
                    
                    // Move from lobby to game screen when room is created successfully
                    setTimeout(() => {
                        onlineLobby.classList.add('hidden');
                        onlineGame.classList.remove('hidden');
                        
                        // Update UI
                        displayRoomCode.textContent = roomId;
                        
                        // Update turn info based on who goes first
                        if (snapshot.val().currentTurn === playerSymbol) {
                            onlineTurnInfo.textContent = `Your Turn (${playerSymbol.toUpperCase()})`;
                            onlineTurnInfo.style.color = 'var(--x-color)';
                            // Show notification about random first player
                            connectionStatus.textContent = "Coin toss: You go first!";
                            connectionStatus.style.color = "green";
                            setTimeout(() => {
                                if (connectionStatus.textContent === "Coin toss: You go first!") {
                                    connectionStatus.textContent = "";
                                }
                            }, 3000);
                        } else {
                            onlineTurnInfo.textContent = "Opponent's Turn";
                            onlineTurnInfo.style.color = 'var(--text-color)';
                            // Show notification about random first player
                            connectionStatus.textContent = "Coin toss: Opponent goes first";
                            connectionStatus.style.color = "orange";
                            setTimeout(() => {
                                if (connectionStatus.textContent === "Coin toss: Opponent goes first") {
                                    connectionStatus.textContent = "";
                                }
                            }, 3000);
                        }
                        
                        // Create the board UI
                        createOnlineGameBoard(gridSize);
                    }, 1000);
                    
                    // Listen for opponent joining
                    listenForOpponent();
                    
                    // Listen for game state changes
                    listenForGameStateChanges();
                } else {
                    console.error("Room creation succeeded but data verification failed");
                    alert("Room was created but could not be verified. Try again or check Firebase settings.");
                    connectionStatus.textContent = "Room verification failed. Please try again.";
                    
                    // Clean up the room reference if it exists
                    if (roomRef) {
                        leaveRoom();
                    }
                }
            })
            .catch(error => {
                firebaseOperationCompleted = true;
                clearTimeout(timeoutId);
                
                console.error("Error creating room:", error);
                alert("Error creating room: " + error.message);
                connectionStatus.textContent = "Error creating room. Please try again.";
                
                // Clean up the room reference if it exists
                if (roomRef) {
                    leaveRoom();
                }
            });
    } catch (error) {
        console.error("Exception when creating room:", error);
        alert("Error initializing room: " + error.message);
        connectionStatus.textContent = "Room creation failed. Please try again.";
    }
}

function joinRoom() {
    const code = roomCodeInput.value.toUpperCase();
    
    if (code.length !== 6) {
        joinError.classList.remove('hidden');
        joinError.textContent = "Room code must be 6 characters.";
        return;
    }
    
    console.log("Attempting to join room:", code);
    joinError.classList.add('hidden');
    connectionStatus.textContent = "Connecting to room...";
    
    // Check if room exists
    const roomRef = firebase.database().ref('rooms/' + code);
    roomRef.once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                console.log("Room not found:", code);
                joinError.classList.remove('hidden');
                joinError.textContent = "Room not found. Please check the code.";
                return;
            }
            
            const data = snapshot.val();
            console.log("Room found:", data);
            
            // Check if room already has 2 players
            if (data.players && data.players.o) {
                console.log("Room is full");
                joinError.classList.remove('hidden');
                joinError.textContent = "Room is full.";
                return;
            }
            
            // Join the room
            playerSymbol = 'o';  // Second player is always O
            roomId = code;
            
            console.log("Joining as player:", playerSymbol);
            
            // Update room data to include the second player
            return roomRef.child('players').update({ 'o': true })
                .then(() => {
                    console.log("Successfully joined room");
                    
                    // Hide lobby, show game
                    onlineLobby.classList.add('hidden');
                    onlineGame.classList.remove('hidden');
                    
                    // Update UI
                    displayRoomCode.textContent = code;
                    
                    // Set up proper turn information
                    if (data.currentTurn === playerSymbol) {
                        onlineTurnInfo.textContent = `Your Turn (${playerSymbol.toUpperCase()})`;
                        onlineTurnInfo.style.color = 'var(--o-color)';
                        // Show notification about random first player
                        connectionStatus.textContent = "Coin toss: You go first!";
                        connectionStatus.style.color = "green";
                        setTimeout(() => {
                            if (connectionStatus.textContent === "Coin toss: You go first!") {
                                connectionStatus.textContent = "";
                            }
                        }, 3000);
                    } else {
                        onlineTurnInfo.textContent = "Opponent's Turn";
                        onlineTurnInfo.style.color = 'var(--text-color)';
                        // Show notification about random first player
                        connectionStatus.textContent = "Coin toss: Opponent goes first";
                        connectionStatus.style.color = "orange";
                        setTimeout(() => {
                            if (connectionStatus.textContent === "Coin toss: Opponent goes first") {
                                connectionStatus.textContent = "";
                            }
                        }, 3000);
                    }
                    
                    // Set up game board - IMPORTANT: Fix the roomRef assignment
                    window.roomRef = roomRef; // Explicitly set as global variable
                    console.log("Global roomRef set for room ID:", code);
                    
                    // Listen for game state changes
                    listenForGameStateChanges();
                    
                    // Create the board UI
                    createOnlineGameBoard(data.gridSize);
                    
                    // Update the board with existing moves
                    if (data.board) {
                        updateOnlineGameBoard(data.board);
                    }
                });
        })
        .catch(error => {
            console.error("Error joining room:", error);
            joinError.classList.remove('hidden');
            joinError.textContent = "Error joining room: " + error.message;
        });
}

function listenForOpponent() {
    if (!roomRef) {
        console.error("No room reference available for listening");
        return;
    }

    console.log("Starting to listen for opponent joining room:", roomId);
    const playersRef = roomRef.child('players');
    
    // First, check the current state to handle page refreshes
    playersRef.once('value')
        .then(snapshot => {
            const players = snapshot.val();
            if (players && players.o) {
                console.log("Opponent already in room on initial check");
                waitingMessage.textContent = "Opponent already in room! Game starting...";
                // Game UI should be handled in the createRoom function
            }
        })
        .catch(err => {
            console.error("Error checking initial player state:", err);
        });
    
    // Then set up the ongoing listener
    playersRef.on('value', snapshot => {
        const players = snapshot.val();
        
        if (players && players.o) {
            // Opponent joined, update the waiting message
            console.log("Opponent joined!", players);
            waitingMessage.textContent = "Opponent joined! Game is ready.";
            onlineTurnInfo.textContent = "Your Turn";
        } else if (players && !players.o) {
            // Reset waiting message if opponent leaves
            console.log("Waiting for opponent to join");
            waitingMessage.textContent = "Waiting for opponent to join...";
            onlineTurnInfo.textContent = "Waiting for opponent...";
        }
    }, error => {
        console.error("Error in players listener:", error);
        connectionStatus.textContent = "Connection error: " + error.message;
    });
}

function listenForGameStateChanges() {
    if (!roomRef) {
        console.error("No room reference available for game state changes");
        
        // Try to reconnect if we have roomId
        if (roomId) {
            console.log("Attempting to reconnect to room:", roomId);
            roomRef = firebase.database().ref('rooms/' + roomId);
            
            if (!roomRef) {
                console.error("Failed to reconnect to room");
                connectionStatus.textContent = "Connection lost. Please refresh the page.";
                return;
            }
            
            console.log("Reconnected to room:", roomId);
        } else {
            console.error("No room ID available for reconnection");
            return;
        }
    }
    
    console.log("Setting up game state listener for room:", roomId);
    
    // First do a single read to get current state
    roomRef.once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                console.error("Room no longer exists:", roomId);
                connectionStatus.textContent = "Game room no longer exists. Please create a new room.";
                return;
            }
            
            console.log("Initial game state:", snapshot.val());
            updateGameDataFromSnapshot(snapshot);
        })
        .catch(error => {
            console.error("Error reading initial game state:", error);
        });
    
    // Then set up the ongoing listener
    roomRef.on('value', snapshot => {
        updateGameDataFromSnapshot(snapshot);
    }, error => {
        console.error("Error in game state listener:", error);
        connectionStatus.textContent = "Error: " + error.message;
    });
}

// Helper function to update game data from a snapshot
function updateGameDataFromSnapshot(snapshot) {
    const data = snapshot.val();
    if (!data) {
        console.error("No data received from Firebase for room:", roomId);
        return;
    }
    
    console.log("Game state update received:", data);
    onlineGameData = data;
    
    // Update the board UI
    updateOnlineGameBoard(data.board);
    
    // Check if this is a fresh board after a restart (all cells empty)
    const isFreshBoard = data.board.every(row => row.every(cell => cell === ''));
    
    // Update turn info
    if (data.gameActive) {
        if (data.undoMode && data.currentTurn === playerSymbol) {
            onlineTurnInfo.textContent = `Select a new position for your ${playerSymbol.toUpperCase()}`;
            onlineTurnInfo.style.color = playerSymbol === 'x' ? 'var(--x-color)' : 'var(--o-color)';
        } else if (data.currentTurn === playerSymbol) {
            onlineTurnInfo.textContent = `Your Turn (${playerSymbol.toUpperCase()})`;
            // Add a visual indicator that it's your turn
            onlineTurnInfo.style.color = playerSymbol === 'x' ? 'var(--x-color)' : 'var(--o-color)';
            
            // Show notification about who goes first if this is a fresh board after restart
            if (isFreshBoard && data.board.length > 0) {
                connectionStatus.textContent = "Coin toss: You go first!";
                connectionStatus.style.color = "green";
                setTimeout(() => {
                    if (connectionStatus.textContent === "Coin toss: You go first!") {
                        connectionStatus.textContent = "";
                    }
                }, 3000);
            }
        } else {
            onlineTurnInfo.textContent = `Opponent's Turn`;
            onlineTurnInfo.style.color = 'var(--text-color)';
            
            // Show notification about who goes first if this is a fresh board after restart
            if (isFreshBoard && data.board.length > 0) {
                connectionStatus.textContent = "Coin toss: Opponent goes first";
                connectionStatus.style.color = "orange";
                setTimeout(() => {
                    if (connectionStatus.textContent === "Coin toss: Opponent goes first") {
                        connectionStatus.textContent = "";
                    }
                }, 3000);
            }
        }
    }
    
    // Check win/draw conditions
    if (data.winner) {
        if (data.winner === playerSymbol) {
            onlineTurnInfo.textContent = "You Lose!";
            onlineTurnInfo.style.color = 'var(--accent-color)';
        } else {
            onlineTurnInfo.textContent = "You Win!";
            onlineTurnInfo.style.color = 'green';
        }
        highlightWinningCells(onlineBoard, data.board, data.winner);
    } else if (data.draw) {
        onlineTurnInfo.textContent = "It's a Draw!";
        onlineTurnInfo.style.color = 'var(--text-color)';
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
            
            // Randomly determine which player goes first for the new game
            const newFirstPlayer = Math.random() < 0.5 ? 'x' : 'o';
            console.log(`New game starting. Random first player selected: ${newFirstPlayer}`);
            
            // Reset the game
            const freshBoard = Array(data.gridSize).fill().map(() => Array(data.gridSize).fill(''));
            roomRef.update({
                board: freshBoard,
                currentTurn: newFirstPlayer, // Randomly selected first player
                gameActive: true,
                winner: null,
                draw: false,
                lastUpdated: Date.now()
            });
            
            onlineRestartBtn.textContent = "Restart Game";
        }
    }
    
    // Check if the other player disconnected
    const otherPlayer = playerSymbol === 'x' ? 'o' : 'x';
    if (!data.players || !data.players[otherPlayer]) {
        connectionStatus.textContent = "Opponent disconnected.";
    } else {
        // Only clear this specific message
        if (connectionStatus.textContent === "Opponent disconnected.") {
            connectionStatus.textContent = "";
        }
    }
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
    if (!board) {
        console.error("No board data provided to updateOnlineGameBoard");
        return;
    }
    
    console.log("Updating board UI with:", board);
    
    // Update each cell in the UI
    const cells = onlineBoard.querySelectorAll('.cell');
    
    if (cells.length !== board.length * board.length) {
        console.error(`Cell count mismatch: UI has ${cells.length} cells, data has ${board.length}x${board.length}`);
    }
    
    board.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
            const index = rowIndex * board.length + colIndex;
            if (index >= cells.length) {
                console.error(`Cell index out of bounds: ${index} >= ${cells.length}`);
                return;
            }
            
            const cell = cells[index];
            
            // Clear existing classes
            cell.classList.remove('x', 'o');
            
            // Update cell content
            if (value) {
                cell.textContent = value.toUpperCase();
                cell.classList.add(value);
                console.log(`Set cell ${rowIndex},${colIndex} to ${value}`);
            } else {
                cell.textContent = '';
            }
        });
    });
}

function handleOnlineCellClick(e) {
    if (!onlineGameData || !onlineGameData.gameActive) {
        console.log("Game not active, ignoring click");
        return;
    }
    
    if (onlineGameData.currentTurn !== playerSymbol) {
        console.log("Not your turn, ignoring click");
        return;
    }
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    console.log(`Cell clicked: row ${row}, col ${col}`);
    
    // Check if we're in undo mode
    if (onlineGameData.undoMode) {
        // Make sure the cell is empty
        if (onlineGameData.board[row][col] !== '') {
            console.log("Cell already filled, ignoring undo placement");
            return;
        }
        
        // Create a deep copy of the board
        const updatedBoard = JSON.parse(JSON.stringify(onlineGameData.board));
        updatedBoard[row][col] = playerSymbol;
        
        // Exit undo mode and update the board
        roomRef.update({
            board: updatedBoard,
            undoMode: false,
            lastMove: { row, col, player: playerSymbol },
            lastUpdated: Date.now()
        }).catch(error => {
            console.error("Error completing undo:", error);
        });
        
        return;
    }
    
    // Regular move handling
    // Check if the cell is already filled
    if (onlineGameData.board[row][col] !== '') {
        console.log("Cell already filled, ignoring click");
        return;
    }
    
    // Make sure we have a valid roomRef
    if (!roomRef) {
        console.error("No roomRef available for updates. Reconnecting...");
        
        // Try to reconnect to the room
        roomRef = firebase.database().ref('rooms/' + roomId);
        
        if (!roomRef) {
            console.error("Failed to reconnect to room");
            alert("Connection to game room lost. Please refresh the page and try again.");
            return;
        }
        
        console.log("Reconnected to room:", roomId);
    }
    
    // Create a deep copy of the board
    const updatedBoard = JSON.parse(JSON.stringify(onlineGameData.board));
    updatedBoard[row][col] = playerSymbol;
    
    console.log("Updated board:", updatedBoard);
    
    // Check for win/draw
    let updates = {
        board: updatedBoard,
        currentTurn: playerSymbol === 'x' ? 'o' : 'x',
        lastMove: { row, col, player: playerSymbol },
        lastUpdated: Date.now()
    };
    
    console.log("Preparing updates:", updates);
    
    // Check for a win (in Reverse Tic-Tac-Toe, three in a row loses)
    if (checkWin(updatedBoard, playerSymbol, 3)) {
        updates.gameActive = false;
        updates.winner = playerSymbol;
        console.log("Win condition detected");
    } else if (checkDraw(updatedBoard)) {
        updates.gameActive = false;
        updates.draw = true;
        console.log("Draw condition detected");
    }
    
    // Provide immediate feedback by updating the UI before Firebase confirms
    e.target.textContent = playerSymbol.toUpperCase();
    e.target.classList.add(playerSymbol);
    onlineTurnInfo.textContent = "Opponent's Turn";
    onlineTurnInfo.style.color = 'var(--text-color)';
    
    // Use transaction for atomic update to prevent race conditions
    const boardRef = roomRef.child('board');
    const currentTurnRef = roomRef.child('currentTurn');
    
    // Update the game state in Firebase
    console.log("Sending updates to Firebase:", updates);
    
    // Start with updating the board
    roomRef.update(updates)
        .then(() => {
            console.log("Move successfully updated in Firebase");
            // Force a refresh of the game state
            return roomRef.once('value');
        })
        .then((snapshot) => {
            console.log("Verified data after update:", snapshot.val());
        })
        .catch(error => {
            console.error("Error updating game state:", error);
            // Revert UI changes if the update fails
            e.target.textContent = '';
            e.target.classList.remove(playerSymbol);
            alert("Error making move: " + error.message + ". Please try again.");
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