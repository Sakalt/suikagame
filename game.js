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
    'cherry',      // 1: 自然出現の最初の果物
    'strawberry',  // 2
    'grape',       // 3
    'pomelo',      // 4
    'persimmon',   // 5: 自然出現の最後の果物
    'apple',       // 6
    'pear',        // 7
    'peach',       // 8
    'pineapple',   // 9
    'melon',       // 10
    'watermelon'   // 11: ダブルスイカ→サクランボの処理
];

function getFruitSize(type) {
    const baseSize = 60; // 基本のサイズ
    const sizeMultiplier = 1 + type * 0.1; // タイプに基づくサイズの増加
    return baseSize * sizeMultiplier;
}

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
        ctx.drawImage(fruit.img, fruit.x, fruit.y, fruit.width, fruit.height);
        ctx.strokeStyle = 'yellow'; 
        ctx.lineWidth = 2; 
        ctx.strokeRect(fruit.x, fruit.y, fruit.width, fruit.height); 
    });

    if (activeFruit) {
        ctx.drawImage(activeFruit.img, activeFruit.x, activeFruit.y, activeFruit.width, activeFruit.height);
        ctx.strokeStyle = 'yellow';  
        ctx.lineWidth = 2;  
        ctx.strokeRect(activeFruit.x, activeFruit.y, activeFruit.width, activeFruit.height);
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
        let type = Math.floor(Math.random() * fruitOrder.length);
        let fruitSize = getFruitSize(type);
        let fruit = {
            img: new Image(),
            x: Math.random() * (canvas.width - fruitSize),
            y: Math.random() * (canvas.height - fruitSize),
            velocityY: Math.random() * 2 + 1,
            velocityX: (Math.random() - 0.5) * 2, // X方向の初速
            type: type,
            width: fruitSize,
            height: fruitSize
        };
        fruit.img.src = fruitImages[fruitOrder[fruit.type]];
        fruitList.push(fruit);
    }
    drawFruit();
}

function updatePhysics() {
    fruitList.forEach(fruit => {
        fruit.y += fruit.velocityY;
        fruit.x += fruit.velocityX;

        // 画面の端に当たったときの処理
        if (fruit.x < 0) {
            fruit.x = 0;
            fruit.velocityX = Math.abs(fruit.velocityX);
        } else if (fruit.x + fruit.width > canvas.width) {
            fruit.x = canvas.width - fruit.width;
            fruit.velocityX = -Math.abs(fruit.velocityX);
        }

        if (fruit.y + fruit.height > canvas.height) {
            fruit.y = canvas.height - fruit.height;
            fruit.velocityY = 0;
        }
    });

    handleCollisions();
    drawFruit();
}

function handleCollisions() {
    for (let i = 0; i < fruitList.length; i++) {
        for (let j = i + 1; j < fruitList.length; j++) {
            const fruitA = fruitList[i];
            const fruitB = fruitList[j];

            if (isColliding(fruitA, fruitB)) {
                if (fruitA.type === fruitB.type) {
                    // 同じ果物がぶつかった場合: 合体
                    fruitB.type = Math.min(fruitB.type + 1, fruitOrder.length - 1);
                    fruitB.img.src = fruitImages[fruitOrder[fruitB.type]];
                    fruitB.width = getFruitSize(fruitB.type);
                    fruitB.height = getFruitSize(fruitB.type);

                    // スイカが2つぶつかったら「サクランボ」に戻る
                    if (fruitA.type === 10) { // スイカ
                        fruitB.type = 0; // サクランボ
                        fruitB.img.src = fruitImages[fruitOrder[0]];
                        fruitB.width = getFruitSize(fruitB.type);
                        fruitB.height = getFruitSize(fruitB.type);
                    }

                    // 合体後のフルーツを消す
                    fruitList.splice(i, 1);
                    updateScore();
                } else {
                    // 異なる果物がぶつかった場合: 跳ね返る
                    bounceOff(fruitA, fruitB);
                }
            }
        }
    }
}

function isColliding(fruitA, fruitB) {
    const dx = fruitA.x - fruitB.x;
    const dy = fruitA.y - fruitB.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (fruitA.width + fruitB.width) / 2;
}

function bounceOff(fruitA, fruitB) {
    // 簡単な跳ね返りの処理
    const tempVelocityX = fruitA.velocityX;
    fruitA.velocityX = fruitB.velocityX;
    fruitB.velocityX = tempVelocityX;
}

function checkGameOver() {
    let gameOver = fruitList.some(fruit => fruit.y + fruit.height > canvas.height);
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
    readyElement.style.display = 'none'; // `Ready!` メッセージを隠す
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
            if (activeFruit.x + activeFruit.width > canvas.width) {
                activeFruit.x = canvas.width - activeFruit.width;
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
            let type = Math.floor(Math.random() * fruitOrder.length); // 自然出現の果物
            activeFruit = {
                img: new Image(),
                x: canvas.width / 2 - getFruitSize(type) / 2,
                y: 0,
                velocityY: 0,
                velocityX: 0,
                type: type,
                width: getFruitSize(type),
                height: getFruitSize(type)
            };
            activeFruit.img.src = fruitImages[fruitOrder[activeFruit.type]];
        }
        drawFruit();
    });
}

window.onload = () => {
    readyElement.style.display = 'block';
    setTimeout(startGame, 3000);
    setupListeners();
};
