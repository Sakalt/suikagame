const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const readyElement = document.getElementById('ready');
const bgm = document.getElementById('bgm');  // BGMの要素を取得

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
    melon: '10.svg',
};

const cloudImage = new Image();
cloudImage.src = '12.svg';  // 雲の画像ファイル

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
    ctx.drawImage(cloudImage, 100, 10, 150, 80);  // 雲を描画する位置とサイズ
}

function drawFruit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCloud();

    fruitList.forEach(fruit => {
        ctx.drawImage(fruit.img, fruit.x, fruit.y, fruitWidth, fruitHeight);
        ctx.strokeStyle = 'yellow';  // 枠の色
        ctx.lineWidth = 2;  // 枠の幅
        ctx.strokeRect(fruit.x, fruit.y, fruitWidth, fruitHeight);  // 枠を描画
    });

    if (activeFruit) {
        ctx.drawImage(activeFruit.img, activeFruit.x, activeFruit.y, fruitWidth, fruitHeight);
        ctx.strokeStyle = 'yellow';  // 枠の色
        ctx.lineWidth = 2;  // 枠の幅
        ctx.strokeRect(activeFruit.x, activeFruit.y, fruitWidth, fruitHeight);  // 枠を描画
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

function isTouchInside(x, y, fruit) {
    return x > fruit.x && x < fruit.x + fruitWidth &&
           y > fruit.y && y < fruit.y + fruitHeight;
}

function handleTouch(x, y) {
    let fruitHit = fruitList.find(fruit => isTouchInside(x, y, fruit));
    if (fruitHit) {
        let index = fruitList.indexOf(fruitHit);
        fruitList.splice(index, 1);  // 当たったフルーツを削除

        updateScore();

        // フルーツが全て消えたら次のフルーツを表示
        if (fruitList.length === 0) {
            createNewFruits();
        } else {
            drawFruit();
        }
    }
}

function createNewFruits() {
    fruitList = [];
    let numFruits = 10;  // 初期に表示するフルーツの数

    for (let i = 0; i < numFruits; i++) {
        let fruit = {
            img: new Image(),
            x: Math.random() * (canvas.width - fruitWidth),
            y: Math.random() * (canvas.height - fruitHeight),
            velocityY: Math.random() * 2 + 1 // 重力による落下速度
        };
        fruit.img.src = fruitImages[fruitOrder[Math.floor(Math.random() * fruitOrder.length)]];
        fruitList.push(fruit);
    }
    drawFruit();
}

function updatePhysics() {
    fruitList.forEach(fruit => {
        fruit.y += fruit.velocityY;  // 重力による落下

        // 底に達したときの処理
        if (fruit.y + fruitHeight > canvas.height) {
            fruit.y = canvas.height - fruitHeight;
            fruit.velocityY = 0;  // 落下停止
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
    bgm.pause();  // ゲームオーバー時にBGMを停止
}

function startGame() {
    score = 0;
    scoreElement.textContent = `スコア: ${score} (最高: ${maxScore})`;
    readyElement.style.display = 'none';
    createNewFruits();
    bgm.play();  // ゲーム開始時にBGMを再生
    gameInterval = setInterval(() => {
        updatePhysics();
        checkGameOver();
    }, 100);  // 0.1秒ごとにチェック
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

        if (isTouchInside(x, y, activeFruit)) {
            handleTouch(x, y);
        } else {
            if (!activeFruit) {
                // 新しい果物をアクティブにする
                activeFruit = {
                    img: new Image(),
                    x: canvas.width / 2 - fruitWidth / 2,
                    y: 0,
                    velocityY: 0 // アクティブな果物の初期速度
                };
                activeFruit.img.src = fruitImages[fruitOrder[Math.floor(Math.random() * fruitOrder.length)]];
            }
            drawFruit();
        }
    });
}

// 初期化
window.onload = () => {
    readyElement.style.display = 'block';
    setTimeout(startGame, 3000);  // 3秒後にゲームスタート
    setupListeners();
};
