const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const readyElement = document.getElementById('ready');
const bgm = document.getElementById('bgm');

const fruitImages = {
    watermelon: '11.svg',
    cherry: '1.svg',
    strawberry: '2.svg',
    grape: '3.svg',
    pomelo: '4.svg',
    persimmon: '5.svg',
    apple: '6.svg',
    pear: '7.svg',
    peach: '8.svg',
    pineapple: '9.svg',
    melon: '10.svg'
};

const cloudImage = new Image();
cloudImage.src = '12.svg'; // 雲の画像ファイル

const fruitOrder = [
    'cherry',
    'strawberry',
    'grape',
    'pomelo',
    'persimmon',
    'apple',
    'pear',
    'peach',
    'pineapple',
    'melon',
    'watermelon'
];

let fruitWidth = 60, fruitHeight = 60;
let score = 0;
let maxScore = localStorage.getItem('maxScore') || 0;
let fruitList = [];
let activeFruit = null;
let gameInterval;

function drawCloud() {
    // 雲を箱の上に描画
    ctx.drawImage(cloudImage, canvas.width / 2 - 75, 50, 150, 80); 
}

function drawFruit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCloud();

    fruitList.forEach(fruit => {
        ctx.drawImage(fruit.img, fruit.x, fruit.y, fruitWidth, fruitHeight);
        ctx.strokeStyle = 'yellow'; 
        ctx.lineWidth = 2; 
        ctx.strokeRect(fruit.x, fruit.y, fruitWidth, fruitHeight); 
    });

    if (activeFruit) {
        ctx.drawImage(activeFruit.img, activeFruit.x, activeFruit.y, fruitWidth, fruitHeight);
        ctx.strokeStyle = 'yellow';  
        ctx.lineWidth = 2;  
        ctx.strokeRect(activeFruit.x, activeFruit.y, fruitWidth, fruitHeight);
    }
}

function updateScore() {
    score++;
    if (score > maxScore) {
        maxScore = score;
        localStorage.setItem('maxScore', maxScore);
    }
    scoreElement.textContent = `スコア: ${score} (最高: ${maxScore})`;
}

function createNewFruits() {
    fruitList = [];
    let numFruits = 10;

    for (let i = 0; i < numFruits; i++) {
        let fruit = {
            img: new Image(),
            x: Math.random() * (canvas.width - fruitWidth),
            y: Math.random() * (canvas.height - fruitHeight),
            velocityY: Math.random() * 2 + 1
        };
        fruit.img.src = fruitImages[fruitOrder[Math.floor(Math.random() * fruitOrder.length)]];
        fruitList.push(fruit);
    }
    drawFruit();
}

function updatePhysics() {
    fruitList.forEach(fruit => {
        fruit.y += fruit.velocityY;

        if (fruit.y + fruitHeight > canvas.height) {
            fruit.y = canvas.height - fruitHeight;
            fruit.velocityY = 0;
        }
    });

    drawFruit();
}

function checkGameOver() {
    let gameOver = fruitList.some(fruit => fruit.y + fruitHeight > canvas.height);
    if (gameOver) {
        gameOver();
    }
}

function gameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px Arial';
    ctx.fillText(`最終スコア: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    clearInterval(gameInterval);
    bgm.pause();
}

function startGame() {
    score = 0;
    scoreElement.textContent = `スコア: ${score} (最高: ${maxScore})`;
    readyElement.style.display = 'none';
    createNewFruits();
    bgm.play();
    gameInterval = setInterval(() => {
        updatePhysics();
        checkGameOver();
    }, 100);
}

function setupListeners() {
    document.getElementById('left').addEventListener('click', () => {
        if (activeFruit) {
            activeFruit.x -= 10;
            if (activeFruit.x < 0) {
                activeFruit.x = 0;
            }
            drawFruit();
        }
    });

    document.getElementById('right').addEventListener('click', () => {
        if (activeFruit) {
            activeFruit.x += 10;
            if (activeFruit.x + fruitWidth > canvas.width) {
                activeFruit.x = canvas.width - fruitWidth;
            }
            drawFruit();
        }
    });

    document.getElementById('drop').addEventListener('click', () => {
        if (activeFruit) {
            fruitList.push(activeFruit);
            activeFruit = null;
            drawFruit();
        }
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (!activeFruit) {
            activeFruit = {
                img: new Image(),
                x: canvas.width / 2 - fruitWidth / 2,
                y: 0,
                velocityY: 0
            };
            activeFruit.img.src = fruitImages[fruitOrder[Math.floor(Math.random() * fruitOrder.length)]];
        }
        drawFruit();
    });
}

window.onload = () => {
    readyElement.style.display = 'block';
    setTimeout(startGame, 3000);
    setupListeners();
};
