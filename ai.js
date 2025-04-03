/**
 * AI implementation for Reverse Tic-Tac-Toe
 * Uses Minimax algorithm with alpha-beta pruning
 * The objective is to force the opponent to get three in a row (and lose)
 */

// Main function that returns the best move for the AI
function aiMove(board, humanSymbol, aiSymbol) {
    // If board is empty, use a good starting move
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === board.length * board.length) {
        // First move: pick center or near-center position for better strategy
        const center = Math.floor(board.length / 2);
        return [center, center];
    }
    
    // Depth limit based on grid size - higher depth for smaller grids
    const maxDepth = board.length === 5 ? 3 : 4;
    
    let bestScore = -Infinity;
    let bestMove = null;
    
    // Alpha-beta pruning bounds
    let alpha = -Infinity;
    let beta = Infinity;
    
    // For 5x5 boards, prioritize center and near-center moves for efficiency
    let moves = emptyCells;
    if (board.length === 5) {
        // Sort moves by distance to center for better alpha-beta efficiency
        const center = Math.floor(board.length / 2);
        moves.sort((a, b) => {
            const distA = Math.abs(a[0] - center) + Math.abs(a[1] - center);
            const distB = Math.abs(b[0] - center) + Math.abs(b[1] - center);
            return distA - distB;
        });
    }
    
    // Try each available move
    for (const [row, col] of moves) {
        // Make a move
        board[row][col] = aiSymbol;
        
        // Evaluate this move (next turn would be human's)
        const score = minimax(board, 0, false, humanSymbol, aiSymbol, maxDepth, alpha, beta);
        
        // Undo the move
        board[row][col] = '';
        
        // Update best move if needed
        if (score > bestScore) {
            bestScore = score;
            bestMove = [row, col];
        }
        
        // Update alpha for pruning
        alpha = Math.max(alpha, bestScore);
        
        // If we've found a winning move, no need to check others
        if (bestScore === 1) break;
    }
    
    // Return the best move or a random move if no good moves found
    return bestMove || emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, isMaximizing, humanSymbol, aiSymbol, maxDepth, alpha, beta) {
    // Current player's symbol
    const currentSymbol = isMaximizing ? aiSymbol : humanSymbol;
    
    // Terminal states: check if someone lost
    if (checkWin(board, humanSymbol, 3)) {
        return 1; // Human lost (3 in a row) -> good for AI
    }
    
    if (checkWin(board, aiSymbol, 3)) {
        return -1; // AI lost (3 in a row) -> bad for AI
    }
    
    // Terminal state: draw or depth limit reached
    const emptyCells = getEmptyCells(board);
    if (emptyCells.length === 0 || depth >= maxDepth) {
        // For depth limits, use a simple heuristic based on potential winning lines
        if (depth >= maxDepth) {
            return evaluatePosition(board, humanSymbol, aiSymbol);
        }
        return 0; // No winner yet
    }
    
    if (isMaximizing) {
        // AI's turn - maximize score
        let bestScore = -Infinity;
        
        for (const [row, col] of emptyCells) {
            // Make move
            board[row][col] = aiSymbol;
            
            // Evaluate with minimax
            const score = minimax(board, depth + 1, false, humanSymbol, aiSymbol, maxDepth, alpha, beta);
            
            // Undo move
            board[row][col] = '';
            
            // Update best score
            bestScore = Math.max(bestScore, score);
            
            // Alpha-beta pruning
            alpha = Math.max(alpha, bestScore);
            if (beta <= alpha) break; // Beta cutoff
        }
        
        return bestScore;
    } else {
        // Human's turn - minimize score
        let bestScore = Infinity;
        
        for (const [row, col] of emptyCells) {
            // Make move
            board[row][col] = humanSymbol;
            
            // Evaluate with minimax
            const score = minimax(board, depth + 1, true, humanSymbol, aiSymbol, maxDepth, alpha, beta);
            
            // Undo move
            board[row][col] = '';
            
            // Update best score
            bestScore = Math.min(bestScore, score);
            
            // Alpha-beta pruning
            beta = Math.min(beta, bestScore);
            if (beta <= alpha) break; // Alpha cutoff
        }
        
        return bestScore;
    }
}

// Simple position evaluation function for depth-limited search
function evaluatePosition(board, humanSymbol, aiSymbol) {
    const humanScore = countPotentialLines(board, humanSymbol);
    const aiScore = countPotentialLines(board, aiSymbol);
    
    // Normalize to [-0.9, 0.9] range
    return (humanScore - aiScore) / 10;
}

// Count potential winning lines (2 in a row with empty space)
function countPotentialLines(board, symbol) {
    let score = 0;
    const gridSize = board.length;
    
    // Check horizontal lines
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col <= gridSize - 3; col++) {
            const line = [board[row][col], board[row][col+1], board[row][col+2]];
            score += evaluateLine(line, symbol);
        }
    }
    
    // Check vertical lines
    for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row <= gridSize - 3; row++) {
            const line = [board[row][col], board[row+1][col], board[row+2][col]];
            score += evaluateLine(line, symbol);
        }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= gridSize - 3; row++) {
        for (let col = 0; col <= gridSize - 3; col++) {
            const line = [board[row][col], board[row+1][col+1], board[row+2][col+2]];
            score += evaluateLine(line, symbol);
        }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= gridSize - 3; row++) {
        for (let col = gridSize - 1; col >= 2; col--) {
            const line = [board[row][col], board[row+1][col-1], board[row+2][col-2]];
            score += evaluateLine(line, symbol);
        }
    }
    
    return score;
}

// Evaluate a single line of 3 cells for potential
function evaluateLine(line, symbol) {
    const symbolCount = line.filter(cell => cell === symbol).length;
    const emptyCount = line.filter(cell => cell === '').length;
    
    // In reverse tic-tac-toe, we want to avoid making lines of our own symbol
    // and force the opponent to make lines of their symbol
    
    // Two symbols with an empty space - dangerous and should be avoided
    if (symbolCount === 2 && emptyCount === 1) {
        return -5;  // Negative score since this is bad for the player
    }
    
    // One symbol with two empty spaces - potential future line
    if (symbolCount === 1 && emptyCount === 2) {
        return -1;  // Slightly negative
    }
    
    return 0;
}

// Get all empty cells on the board
function getEmptyCells(board) {
    const emptyCells = [];
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === '') {
                emptyCells.push([row, col]);
            }
        }
    }
    return emptyCells;
}

// Check if a player has won (or lost, in Reverse Tic-Tac-Toe)
function checkWin(board, symbol, lineLength = 3) {
    const gridSize = board.length;
    
    // Check horizontal lines
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col <= gridSize - lineLength; col++) {
            let match = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row][col + i] !== symbol) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
    }
    
    // Check vertical lines
    for (let col = 0; col < gridSize; col++) {
        for (let row = 0; row <= gridSize - lineLength; row++) {
            let match = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row + i][col] !== symbol) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let row = 0; row <= gridSize - lineLength; row++) {
        for (let col = 0; col <= gridSize - lineLength; col++) {
            let match = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row + i][col + i] !== symbol) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let row = 0; row <= gridSize - lineLength; row++) {
        for (let col = gridSize - 1; col >= lineLength - 1; col--) {
            let match = true;
            for (let i = 0; i < lineLength; i++) {
                if (board[row + i][col - i] !== symbol) {
                    match = false;
                    break;
                }
            }
            if (match) return true;
        }
    }
    
    return false;
}

// Export the AI move function for use in script.js
window.aiMove = aiMove; 