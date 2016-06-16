var GRAVITY = .5;
var OUTER_BOUND = 1000;
var MAKE_FRUIT_FREQUENCY = 1000;
var MAKE_BOMB_FREQUENCY = 800;
var MAKE_BONUS_TOKEN_FREQUENCY = 500;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(130, window.innerWidth / window.innerHeight, 0.1, OUTER_BOUND);
var renderer = new THREE.WebGLRenderer();
var menu = document.getElementById('menu');
var announcement = document.getElementById('announcement');
var nextLevelButton = document.getElementById('nextLevelButton');

renderer.setSize(window.innerWidth, window.innerHeight);

var topLight = new THREE.DirectionalLight(0xffffff, 1.5);
topLight.position.set(-10, 50, 50);
var bottomLight = new THREE.DirectionalLight(0xffffff);
bottomLight.position.set(-10, -50, 50);
scene.add(topLight);
scene.add(bottomLight);

var scoreboard = document.getElementById('scoreboard');

document.body.appendChild(renderer.domElement);
document.addEventListener('mousedown', onDocumentMouseDown, false);

//////////////explosion settings/////////
var movementSpeed = 50;
var totalObjects = 5000;
var objectSize = 1;
var sizeRandomness = 2000;
var colors = [0xFF000F];
/////////////////////////////////
var dirs = [];
var parts = [];

var container = document.createElement('div');
document.body.appendChild(container);

window.addEventListener('mousedown', onclick, false);


var spawnInterval = -1;
var bombSpawnInterval = -1;
var bonusTokenPresent = false;
var bonusToken;

var fruits = [];
var removeFruits = [];
var bombs = [];

var hits = 0;
var misses = 0;
var total = 0;
var level = 0;
var levelData = [{
    "goal": 10,
    "speed": 2
}, {
    "goal": 10,
    "speed": 4
}, {
    "goal": 13,
    "speed": 4
}, {
    "goal": 13,
    "speed": 8
}, {
    "goal": 15,
    "speed": 8
}, {
    "goal": 15,
    "speed": 16
}, ];

function updateScoreBoard() {
    var scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = '<h3>Hits: ' + hits + '</h3><h3>Misses: ' + misses + '</h3><h3>Level: ' + (level + 1) + '</h3>'
}

function resetScoreBoard() {
    hits = 0;
    misses = 0;
    total = 0;
    updateScoreBoard();
}

function gravitate(projectile) {
  projectile.velocity.y -= GRAVITY;
}

function bounce(fruit) {
    if (fruit.position.y < 0) {
        fruit.velocity.y *= -1;
    }
}

function spiral(projectile) {
  var distance = Math.sqrt(Math.pow(projectile.position.x, 2) + Math.pow(projectile.position.y, 2));
  var theta = Math.atan(projectile.position.x / projectile.position.y);
  projectile.position.x = projectile.radius * Math.cos(theta);
  projectile.position.y = projectile.radius * Math.sin(theta);
  projectile.position.z += projectile.velocity.z;
}

function render() {
  var pCount = parts.length;
  while(pCount--) {
    parts[pCount].updateExplosion();
  }

  renderer.render(scene, camera);
}

function update() {

    if (bonusTokenPresent) {
      if (bonusToken.position.x < window.innerWidth) {
        bonusToken.rotation.x += 0.1;
        spiral(bonusToken);
      } else {
        bonusTokenPresent = false;
        scene.remove( bonusToken );
      }
    }
    for (fruit of removeFruits) {
        fruits.splice(fruits.indexOf(fruit), 1);
        scene.remove(fruit);
    }
    removeFruits = [];
    for (fruit of fruits) {
        if (fruit.position.z < -OUTER_BOUND) {
            removeFruits.push(fruit);
            misses++;
            updateScoreBoard();
        } else {
	        fruit.position.x += fruit.velocity.x;
            fruit.position.y += fruit.velocity.y;
            fruit.position.z -= fruit.velocity.z;
            fruit.rotation.x += .1;
            fruit.rotation.y += .1;
            gravitate(fruit);
            bounce(fruit);
        }
    }
    for (bomb of bombs) {
        bomb.position.x += bomb.velocity.x;
        if (bomb.position.z < -OUTER_BOUND) {
            scene.remove(bomb);
            bombs.splice(bombs.indexOf(bomb), 1);
        } else {
            bomb.position.y += bomb.velocity.y;
            bomb.position.z -= bomb.velocity.z;
            bomb.rotation.x += .1;
            bomb.rotation.y += .1;
            gravitate(bomb);
            bounce(bomb);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
};

function setProjectileSpeed(projectile) {
    projectile.position.z = -Math.random() * camera.fov * .1;
    projectile.position.y = 0;
    if (projectile.projectile == "bomb") {
        projectile.position.x = -(Math.random() * (camera.fov / 4) + (camera.fov / 2));
    } else {
        projectile.position.x = (Math.random() * (camera.fov / 4) + (camera.fov / 2));
    }
    projectile.velocity = {};
    projectile.velocity.z = Math.random() * 7 + levelData[level].speed;
    projectile.velocity.y = Math.random() * 10 + 10;
    projectile.velocity.x = Math.random() * projectile.velocity.z;
	projectile.velocity.x += projectile.projectile == "bomb" ? projectile.velocity.z :  -projectile.velocity.z;
}

function drawBomb() {
    var geometry = new THREE.SphereGeometry(camera.fov * 0.5, 100, 100);
    var material = new THREE.MeshPhongMaterial({
        color: 0x990000,
        specular: 0x222222,
        shininess: 10
    });
    var bomb = new THREE.Mesh(geometry, material);
    bomb.projectile = "bomb";
    setProjectileSpeed(bomb);
    bombs.push(bomb);
    scene.add(bomb);
}

function drawFruit() {
    var geometry = new THREE.SphereGeometry(camera.fov * 0.3, 5, 1);
    var material = new THREE.MeshNormalMaterial({});
    material.color = 0xff0000;
    var fruit = new THREE.Mesh(geometry, material);
    fruit.projectile = "fruit";
    setProjectileSpeed(fruit);
    fruits.push(fruit);
    scene.add(fruit);
    total++;
}

function makeBomb() {
    if (Math.random() > .8) {
        drawBomb();
    }
}

function drawBonusToken() {
  if (total > 0 && total % 2 == 0 && !bonusTokenPresent) {
    bonusTokenPresent = true;
    var geometry = new THREE.CylinderGeometry( 30,30,10,300 );
    var material = new THREE.MeshPhongMaterial({ color: 0xff9900, specular: 0x009900, shininess: 30, shading: THREE.FlatShading });
    bonusToken = new THREE.Mesh( geometry, material );
    scene.add( bonusToken );
    // bonusToken.position.x = -window.innerWidth;
    bonusToken.center = { x: 0, y: 0, z: 0 };
    bonusToken.radius = window.innerHeight / 4;
    bonusToken.force = GRAVITY;
    bonusToken.position.x = bonusToken.radius;
    bonusToken.position.y = bonusToken.radius;
    bonusToken.position.z = -200;
    bonusToken.rotation.x = 90;
    bonusToken.velocity = { x: 0, y: 0, z: -2 };
    bonusToken.projectile = "bonusToken";
  }
}

function emptyArray(projectiles) {
    for (var i = projectiles.length - 1; i > -1; i--) {
        scene.remove(projectiles[i]);
        projectiles.splice(projectiles.indexOf(projectiles[i]), 1);
    }
}

function startLevel() {
    parts.push(new ExplodeAnimation(0, 0));
    drawBonusToken();
    menu.style.visibility = "hidden";
    resetScoreBoard();
    emptyArray(fruits);
    emptyArray(bombs);
    spawnInterval = setInterval(drawFruit, MAKE_FRUIT_FREQUENCY);
    bombSpawnInterval = setInterval(makeBomb, MAKE_BOMB_FREQUENCY);
    bonusTokenSpawnInterval = setInterval(drawBonusToken, MAKE_BONUS_TOKEN_FREQUENCY);
}

function nextLevel() {
    clearInterval(spawnInterval);
    clearInterval(bombSpawnInterval);
    spawnInterval = -1;
    bombSpawnInterval = -1;
    if (level == 0) {
        announcement.innerHTML = "Welcome to Fruity Shooty!";
        nextLevelButton.innerHTML = "Start";
    } else if (level >= levelData.length) {
        level = 0;
        announcement.innerHTML = "YOU WIN!!!";
        nextLevelButton.innerHTML = "Play Again!";
    } else {
        announcement.innerHTML = "Level " + level + " Complete!";
        nextLevelButton.innerHTML = "Start Level " + (level + 1);
    }
    menu.style.visibility = "visible";
}



// parts.push(new ExplodeAnimation(0, 0));

function ExplodeAnimation(x,y)
{
  var geometry = new THREE.Geometry();

  for (i = 0; i < totalObjects; i ++)
  {
    var vertex = new THREE.Vector3();
    vertex.x = x;
    vertex.y = y;
    vertex.z = 0;

    geometry.vertices.push( vertex );
    dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
  }
  var material = new THREE.PointsMaterial( { size: objectSize,  color: 0xffffff });
  var particles = new THREE.Points( geometry, material );

  this.object = particles;
  this.status = true;

  this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
  this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);

  scene.add( this.object  );

  this.updateExplosion = function(){
    if (this.status == true){
      var pCount = totalObjects;
      while(pCount--) {
        var particle =  this.object.geometry.vertices[pCount]
        particle.y += dirs[pCount].y;
        particle.x += dirs[pCount].x;
        particle.z += dirs[pCount].z;
      }
      this.object.geometry.verticesNeedUpdate = true;
    }
  }

}



function bombExplosion(x,y) {
  parts.push(new ExplodeAnimation(x,y));
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}


function onDocumentMouseDown(event) {
    if (spawnInterval != -1) {
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children);

        if (intersects.length > 0) {
            switch (intersects[0].object.projectile) {
                case "fruit":
                    removeFruits.push(intersects[0].object);
                    hits++;
                    updateScoreBoard();
                    if (hits == levelData[level].goal) {
                        level++;
                        nextLevel();
                    }
                    break;
                case "bomb":
                    hits = 0;
                    bombExplosion(0,0);
                    scene.remove(intersects[0].object);
                    updateScoreBoard();
                    break;
                case "bonusToken":
                    console.log("hit the bonus");
                    bonusTokenPresent = false;
                    scene.remove( bonusToken );
                    break;
            }
        }
    }
}

nextLevel();
animate();
