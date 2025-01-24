const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const enemiesContainer = document.getElementById('enemies');
const bossElement = document.getElementById('boss');
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const bossAnnouncement = document.getElementById('boss-announcement');

let playerX = window.innerWidth / 2 - 25;
let bullets = [];
let enemies = [];
let enemySpeed = 2;
let enemyDirection = 1;
let currentLevel = 1;
let isBossLevel = false;
let bossHealth = 0;
let bossActive = false;
let score = 0;

player.style.left = `${playerX}px`;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' && playerX > 0) {
    playerX -= 10;
  } else if (e.key === 'ArrowRight' && playerX < window.innerWidth - 50) {
    playerX += 10;
  } else if (e.key === ' ') {
    shoot();
  }
  player.style.left = `${playerX}px`;
});

function shoot() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = `${playerX + 22.5}px`;
  bullet.style.bottom = '70px';
  gameContainer.appendChild(bullet);
  bullets.push(bullet);
}

function moveBullets() {
  bullets.forEach((bullet, index) => {
    const bottom = parseInt(bullet.style.bottom);
    if (bottom > window.innerHeight) {
      bullet.remove();
      bullets.splice(index, 1);
    } else {
      bullet.style.bottom = `${bottom + 10}px`;
    }
  });
}

function createEnemies() {
  enemiesContainer.innerHTML = '';
  enemies = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const enemy = document.createElement('div');
      enemy.classList.add('enemy');
      enemy.style.left = `${col * 60 + 30}px`;
      enemy.style.top = `${row * 50 + 30}px`;
      enemiesContainer.appendChild(enemy);
      enemies.push(enemy);
    }
  }
}

function moveEnemies() {
  if (isBossLevel) return;

  const leftmost = Math.min(...enemies.map(enemy => parseInt(enemy.style.left)));
  const rightmost = Math.max(...enemies.map(enemy => parseInt(enemy.style.left) + 40));

  if (leftmost <= 0 || rightmost >= window.innerWidth) {
    enemyDirection *= -1;
    enemies.forEach(enemy => {
      enemy.style.top = `${parseInt(enemy.style.top) + 20}px`;
    });
  }

  enemies.forEach(enemy => {
    enemy.style.left = `${parseInt(enemy.style.left) + enemySpeed * enemyDirection}px`;
  });
}

function createBoss() {
  clearEnemies();
  bossElement.style.display = 'block';
  bossElement.style.left = `${window.innerWidth / 2 - 40}px`;
  bossElement.style.top = '50px';
  bossActive = true;
  isBossLevel = true;

  bossHealth = 5 + currentLevel * 2;
  enemySpeed = 2 + currentLevel * 0.5;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 6; col++) {
      const enemy = document.createElement('div');
      enemy.classList.add('enemy');
      enemy.style.left = `${col * 80 + 50}px`;
      enemy.style.top = `${row * 60 + 100}px`;
      enemiesContainer.appendChild(enemy);
      enemies.push(enemy);
    }
  }

  announceBoss();
}

function announceBoss() {
  bossAnnouncement.textContent = `BOSS FIGHT!`;
  bossAnnouncement.style.display = 'block';
  setTimeout(() => {
    bossAnnouncement.style.display = 'none';
  }, 1000);
}

function moveBoss() {
  if (bossActive) {
    const bossRect = bossElement.getBoundingClientRect();
    if (bossRect.left <= 0 || bossRect.right >= window.innerWidth) {
      enemyDirection *= -1;
    }
    bossElement.style.left = `${parseInt(bossElement.style.left) + enemySpeed * enemyDirection}px`;

    if (Math.random() < 0.02) {
      shootBossLaser();
    }
  }
}

function shootBossLaser() {
  const laser = document.createElement('div');
  laser.classList.add('boss-laser');
  laser.style.left = `${parseInt(bossElement.style.left) + 40}px`;
  laser.style.top = '100px';
  gameContainer.appendChild(laser);

  const interval = setInterval(() => {
    const top = parseInt(laser.style.top);
    if (top > window.innerHeight) {
      laser.remove();
      clearInterval(interval);
    } else {
      laser.style.top = `${top + 15}px`;
    }

    const laserRect = laser.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    if (
      laserRect.left < playerRect.right &&
      laserRect.right > playerRect.left &&
      laserRect.top < playerRect.bottom &&
      laserRect.bottom > playerRect.top
    ) {
      alert('Game Over!');
      window.location.reload();
    }
  }, 50);
}

function checkCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    const bulletRect = bullet.getBoundingClientRect();

    enemies.forEach((enemy, enemyIndex) => {
      const enemyRect = enemy.getBoundingClientRect();
      if (
        bulletRect.left < enemyRect.right &&
        bulletRect.right > enemyRect.left &&
        bulletRect.top < enemyRect.bottom &&
        bulletRect.bottom > enemyRect.top
      ) {
        bullet.remove();
        enemy.remove();
        bullets.splice(bulletIndex, 1);
        enemies.splice(enemyIndex, 1);
        score += 10;
        scoreDisplay.textContent = `Score: ${score}`;
      }
    });

    if (bossActive) {
      checkBossCollisions(bullet, bulletIndex);
    }
  });
}

function checkBossCollisions(bullet, bulletIndex) {
  const bossRect = bossElement.getBoundingClientRect();
  const bulletRect = bullet.getBoundingClientRect();
  if (
    bulletRect.left < bossRect.right &&
    bulletRect.right > bossRect.left &&
    bulletRect.top < bossRect.bottom &&
    bulletRect.bottom > bossRect.top
  ) {
    bullet.remove();
    bullets.splice(bulletIndex, 1);
    bossHealth--;
    
    if (bossHealth <= 0) {
      bossElement.style.display = 'none';
      bossActive = false;
      score += 100;
      scoreDisplay.textContent = `Score: ${score}`;
      isBossLevel = false;
      currentLevel++;
      levelDisplay.textContent = `Level: ${currentLevel}`;
      createEnemies();
    }
  }
}

function clearEnemies() {
  enemies.forEach(enemy => enemy.remove());
  enemies = [];
}

function checkLevelCompletion() {
  if (isBossLevel) {
    if (bossHealth <= 0) {
      isBossLevel = false;
      currentLevel++;
      levelDisplay.textContent = `Level: ${currentLevel}`;
      createEnemies();
    }
  } else {
    if (enemies.length === 0) {
      isBossLevel = true;
      createBoss();
    }
  }
}

function gameLoop() {
  moveBullets();
  moveEnemies();
  if (isBossLevel) moveBoss();
  checkCollisions();
  checkLevelCompletion();
  requestAnimationFrame(gameLoop);
}

createEnemies();
gameLoop();