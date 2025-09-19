// 五子棋游戏类
class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black'; // 'black' 或 'white'
        this.gameOver = false;
        this.moveHistory = [];
        this.stats = {
            blackWins: 0,
            whiteWins: 0,
            draws: 0
        };
        
        this.initGame();
        this.bindEvents();
        this.loadStats();
    }
    
    // 初始化游戏
    initGame() {
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(null));
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        
        this.createBoard();
        this.updateUI();
    }
    
    // 创建棋盘DOM
    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', () => this.makeMove(row, col));
                gameBoard.appendChild(cell);
            }
        }
    }
    
    // 下棋
    makeMove(row, col) {
        if (this.gameOver || this.board[row][col] !== null) {
            return false;
        }
        
        // 放置棋子
        this.board[row][col] = this.currentPlayer;
        this.moveHistory.push({ row, col, player: this.currentPlayer });
        
        // 更新显示
        this.placePiece(row, col, this.currentPlayer);
        
        // 检查胜利
        if (this.checkWin(row, col)) {
            this.endGame(this.currentPlayer);
            return true;
        }
        
        // 检查平局
        if (this.isBoardFull()) {
            this.endGame('draw');
            return true;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updateUI();
        
        return true;
    }
    
    // 在DOM中放置棋子
    placePiece(row, col, player) {
        const cells = document.querySelectorAll('.board-cell');
        const cellIndex = row * this.boardSize + col;
        const cell = cells[cellIndex];
        
        const piece = document.createElement('div');
        piece.className = `piece ${player}`;
        cell.appendChild(piece);
    }
    
    // 检查胜利
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1; // 包含当前棋子
            const winningPieces = [[row, col]];
            
            // 向一个方向查找
            for (let i = 1; i < 5; i++) {
                const newRow = row + i * dx;
                const newCol = col + i * dy;
                
                if (this.isValidPosition(newRow, newCol) && 
                    this.board[newRow][newCol] === player) {
                    count++;
                    winningPieces.push([newRow, newCol]);
                } else {
                    break;
                }
            }
            
            // 向相反方向查找
            for (let i = 1; i < 5; i++) {
                const newRow = row - i * dx;
                const newCol = col - i * dy;
                
                if (this.isValidPosition(newRow, newCol) && 
                    this.board[newRow][newCol] === player) {
                    count++;
                    winningPieces.unshift([newRow, newCol]);
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                this.highlightWinningPieces(winningPieces.slice(0, 5));
                return true;
            }
        }
        
        return false;
    }
    
    // 高亮获胜棋子
    highlightWinningPieces(pieces) {
        pieces.forEach(([row, col]) => {
            const cells = document.querySelectorAll('.board-cell');
            const cellIndex = row * this.boardSize + col;
            const cell = cells[cellIndex];
            const piece = cell.querySelector('.piece');
            if (piece) {
                piece.classList.add('winning');
            }
        });
    }
    
    // 检查位置是否有效
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && 
               col >= 0 && col < this.boardSize;
    }
    
    // 检查棋盘是否已满
    isBoardFull() {
        return this.board.every(row => row.every(cell => cell !== null));
    }
    
    // 结束游戏
    endGame(winner) {
        this.gameOver = true;
        
        if (winner === 'draw') {
            this.stats.draws++;
            document.getElementById('gameStatus').textContent = '游戏平局！';
        } else {
            const winnerName = winner === 'black' ? '黑子' : '白子';
            document.getElementById('gameStatus').textContent = `${winnerName} 获胜！`;
            
            if (winner === 'black') {
                this.stats.blackWins++;
            } else {
                this.stats.whiteWins++;
            }
        }
        
        this.saveStats();
        this.updateStatsDisplay();
    }
    
    // 更新UI
    updateUI() {
        const playerName = this.currentPlayer === 'black' ? '黑子' : '白子';
        document.getElementById('currentPlayer').textContent = playerName;
        
        if (!this.gameOver) {
            document.getElementById('gameStatus').textContent = '游戏进行中...';
        }
    }
    
    // 重置游戏
    resetGame() {
        this.initGame();
    }
    
    // 悔棋
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) {
            return;
        }
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = null;
        
        // 移除DOM中的棋子
        const cells = document.querySelectorAll('.board-cell');
        const cellIndex = lastMove.row * this.boardSize + lastMove.col;
        const cell = cells[cellIndex];
        const piece = cell.querySelector('.piece');
        if (piece) {
            piece.remove();
        }
        
        // 切换回上一个玩家
        this.currentPlayer = lastMove.player;
        this.updateUI();
    }
    
    // 提示功能（简单的AI建议）
    getHint() {
        if (this.gameOver) return null;
        
        // 简单的提示逻辑：寻找空位
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (this.board[row][col] === null) {
                    // 检查周围是否有棋子
                    if (this.hasNeighbor(row, col)) {
                        return { row, col };
                    }
                }
            }
        }
        
        // 如果没有找到好位置，返回中心位置
        const center = Math.floor(this.boardSize / 2);
        if (this.board[center][center] === null) {
            return { row: center, col: center };
        }
        
        return null;
    }
    
    // 检查位置周围是否有棋子
    hasNeighbor(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (this.isValidPosition(newRow, newCol) && 
                this.board[newRow][newCol] !== null) {
                return true;
            }
        }
        
        return false;
    }
    
    // 显示提示
    showHint() {
        const hint = this.getHint();
        if (hint) {
            const cells = document.querySelectorAll('.board-cell');
            const cellIndex = hint.row * this.boardSize + hint.col;
            const cell = cells[cellIndex];
            
            // 临时高亮提示位置
            cell.style.background = 'rgba(255, 215, 0, 0.6)';
            setTimeout(() => {
                cell.style.background = '';
            }, 2000);
        }
    }
    
    // 保存统计数据
    saveStats() {
        try {
            localStorage.setItem('gomoku-stats', JSON.stringify(this.stats));
        } catch (error) {
            // 在沙盒环境中无法访问localStorage，忽略错误
            console.log('localStorage不可用，统计数据将不会保存');
        }
    }
    
    // 加载统计数据
    loadStats() {
        try {
            const saved = localStorage.getItem('gomoku-stats');
            if (saved) {
                this.stats = JSON.parse(saved);
            }
        } catch (error) {
            // 在沙盒环境中无法访问localStorage，使用默认值
            console.log('localStorage不可用，使用默认统计数据');
        }
        this.updateStatsDisplay();
    }
    
    // 更新统计显示
    updateStatsDisplay() {
        document.getElementById('blackWins').textContent = this.stats.blackWins;
        document.getElementById('whiteWins').textContent = this.stats.whiteWins;
        document.getElementById('draws').textContent = this.stats.draws;
    }
    
    // 绑定事件
    bindEvents() {
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoMove();
        });
        
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
    }
}

// 初始化游戏
console.log('五子棋游戏初始化中...');

// 创建游戏实例
window.gomokuGame = new GomokuGame();

console.log('五子棋游戏已准备就绪！');

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        window.gomokuGame.resetGame();
    } else if (e.key === 'u' || e.key === 'U') {
        window.gomokuGame.undoMove();
    } else if (e.key === 'h' || e.key === 'H') {
        window.gomokuGame.showHint();
    }
});