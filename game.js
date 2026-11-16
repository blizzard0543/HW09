// 貪吃蛇遊戲核心邏輯

class SnakeGame {
    /**
     * 貪吃蛇遊戲建構子
     * @param {HTMLCanvasElement} canvas - 遊戲畫布元素
     * @param {HTMLElement} scoreElement - 顯示分數的 DOM 元素
     */
    constructor(canvas, scoreElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scoreElement = scoreElement;
        
        // 網格與尺寸設定
        this.gridSize = 20; // 每個格子的像素大小
        this.tileCount = this.canvas.width / this.gridSize; // 畫布上的總網格數

        // 遊戲狀態變數
        this.snake = [];
        this.food = {};
        this.dx = 0; // X 軸移動方向
        this.dy = 0; // Y 軸移動方向
        this.score = 0;
        this.speed = 120; // 遊戲更新間隔 (毫秒)
        this.gameLoopInterval = null;
        this.isGameOver = false;

        // 綁定鍵盤事件，使用 bind 確保 this 指向類別實例
        document.addEventListener('keydown', this.handleInput.bind(this));
    }

    /**
     * 初始化遊戲狀態，用於遊戲剛載入或重新開始時
     */
    init() {
        // 初始貪吃蛇位置 (放置於畫布中央)
        this.snake = [
            { x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }
        ];
        
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.isGameOver = false;
        
        this.updateScoreDisplay();
        this.spawnFood();
        this.clearCanvas();
        this.drawSnake();
        this.drawFood();
    }

    /**
     * 開始遊戲，啟動遊戲迴圈
     */
    start() {
        this.init();
        
        // 避免重複觸發 setInterval
        if (this.gameLoopInterval) {
            clearInterval(this.gameLoopInterval);
        }
        
        // 預設向右移動
        this.dx = 1;
        this.dy = 0;
        
        // 使用 setInterval 控制遊戲迴圈
        this.gameLoopInterval = setInterval(() => this.gameLoop(), this.speed);
    }

    /**
     * 遊戲主迴圈，負責更新與繪製
     */
    gameLoop() {
        this.update();
        
        if (this.isGameOver) {
            this.handleGameOver();
            return;
        }
        
        this.clearCanvas();
        this.drawFood();
        this.drawSnake();
    }

    /**
     * 更新遊戲邏輯：移動、吃食物、碰撞偵測
     */
    update() {
        // 計算新的頭部位置
        const head = { 
            x: this.snake[0].x + this.dx, 
            y: this.snake[0].y + this.dy 
        };

        // 碰撞偵測：撞牆
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.isGameOver = true;
            return;
        }

        // 碰撞偵測：撞到自己的身體
        for (let part of this.snake) {
            if (part.x === head.x && part.y === head.y) {
                this.isGameOver = true;
                return;
            }
        }

        // 將新頭部加入蛇的陣列前端
        this.snake.unshift(head);

        // 判斷是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScoreDisplay();
            this.spawnFood(); // 重新生成食物
        } else {
            // 沒吃到食物則移除尾巴，保持長度
            this.snake.pop();
        }
    }

    /**
     * 隨機生成食物，並確保不會生成在蛇的身體上
     */
    spawnFood() {
        let newFoodPosition;
        let isOccupied = true;
        
        while (isOccupied) {
            newFoodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            
            // 檢查新位置是否與蛇的任何部分重疊
            isOccupied = this.snake.some(part => part.x === newFoodPosition.x && part.y === newFoodPosition.y);
        }
        
        this.food = newFoodPosition;
    }

    /**
     * 清空畫布背景
     */
    clearCanvas() {
        // 嚴格遵守指南：畫布背景為純黑 #000000
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 繪製貪吃蛇
     */
    drawSnake() {
        this.snake.forEach((part, index) => {
            // 頭部顏色略亮於身體，提升視覺層次
            this.ctx.fillStyle = index === 0 ? '#66BB6A' : '#4CAF50';
            
            // 繪製方塊時保留 1px 間距，讓蛇節分明
            this.ctx.fillRect(
                part.x * this.gridSize, 
                part.y * this.gridSize, 
                this.gridSize - 1, 
                this.gridSize - 1
            );
        });
    }

    /**
     * 繪製食物
     */
    drawFood() {
        this.ctx.fillStyle = '#FF5252';
        this.ctx.fillRect(
            this.food.x * this.gridSize, 
            this.food.y * this.gridSize, 
            this.gridSize - 1, 
            this.gridSize - 1
        );
    }

    /**
     * 處理玩家鍵盤輸入方向
     * @param {KeyboardEvent} event 
     */
    handleInput(event) {
        // 防止方向鍵導致整個網頁捲動
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
        }

        const goingUp = this.dy === -1;
        const goingDown = this.dy === 1;
        const goingRight = this.dx === 1;
        const goingLeft = this.dx === -1;

        // 確保不會直接 180 度回頭
        switch (event.key) {
            case 'ArrowLeft':
                if (!goingRight) { this.dx = -1; this.dy = 0; }
                break;
            case 'ArrowUp':
                if (!goingDown) { this.dx = 0; this.dy = -1; }
                break;
            case 'ArrowRight':
                if (!goingLeft) { this.dx = 1; this.dy = 0; }
                break;
            case 'ArrowDown':
                if (!goingUp) { this.dx = 0; this.dy = 1; }
                break;
        }
    }

    /**
     * 更新畫面上的分數
     */
    updateScoreDisplay() {
        this.scoreElement.textContent = this.score;
    }

    /**
     * 遊戲結束狀態處理
     */
    handleGameOver() {
        clearInterval(this.gameLoopInterval);
        
        // 畫一層半透明黑色遮罩
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 顯示 Game Over 文字
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 30px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    }
}

// 當 DOM 元素載入完成後初始化事件
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const scoreElement = document.getElementById('score');
    const startBtn = document.getElementById('startBtn');

    // 建立遊戲實例
    const game = new SnakeGame(canvas, scoreElement);
    game.init();

    // 綁定按鈕事件
    startBtn.addEventListener('click', () => {
        game.start();
        startBtn.textContent = '重新開始';
        startBtn.blur(); // 移除焦點，避免遊戲進行中按空白鍵誤觸
    });
}); 