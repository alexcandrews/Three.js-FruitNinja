var GRAVITY = .5;
var BOUNDS = 600;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(130, window.innerWidth / window.innerHeight, 0.1, BOUNDS);
var renderer = new THREE.WebGLRenderer();
var menu = document.getElementById('menu');
var announcement = document.getElementById('announcement');
var nextLevelButton = document.getElementById('nextLevelButton');

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
document.addEventListener('mousedown', onDocumentMouseDown, false);

var spawnInterval = -1;

var fruits = [];
var removeFruits = [];

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

function gravitate(fruit) {
    fruit.velocity.y -= GRAVITY;
}

function bounce(fruit) {
    if (fruit.position.y < 0) {
        fruit.velocity.y *= -1;
    }
}

function render() {
    renderer.render(scene, camera);
}

function update() {
    for (fruit of removeFruits) {
        fruits.splice(fruits.indexOf(fruit), 1);
        scene.remove(fruit);
    }
    removeFruits = [];
    for (fruit of fruits) {
        fruit.position.x += fruit.velocity.x;
        if (fruit.position.z < -BOUNDS) {
            removeFruits.push(fruit);
            misses++;
        } else {
            fruit.position.y += fruit.velocity.y;
            fruit.position.z -= fruit.velocity.z;
            fruit.rotation.x += .1;
            fruit.rotation.y += .1;
            gravitate(fruit);
            bounce(fruit);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
    update();
};

function init() {
    var geometry = new THREE.SphereGeometry(camera.fov * 0.5, 5, 1);
    var material = new THREE.MeshNormalMaterial({});
    var fruit = new THREE.Mesh(geometry, material);
    fruit.position.z = -Math.random() * camera.fov * .1;
    fruit.position.y = 0;
    fruit.position.x = Math.random() * (camera.fov / 4) + (camera.fov / 2);
    fruit.velocity = {};
    fruit.velocity.z = Math.random() * 7 + levelData[level].speed;
    fruit.velocity.y = Math.random() * 10 + 10;
    fruit.velocity.x = Math.random() * fruit.velocity.z;
    fruits.push(fruit);
    scene.add(fruit);
    total++;
};

function startLevel() {
    console.log(level);
    menu.style.visibility = "hidden";
    for (fruit of fruits) {
        fruits.splice(fruits.indexOf(fruit), 1);
        scene.remove(fruit);
    }
    spawnInterval = setInterval(init, 1000);
}

function nextLevel() {
    clearInterval(spawnInterval);
    if (level == 0) {
        announcement.innerHTML = "Welcome to Fruity Shooty!";
        nextLevelButton.innerHTML = "Start Level 1";
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

function onDocumentMouseDown(event) {
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        removeFruits.push(intersects[0].object);
        hits++;
        if (hits == levelData[level].goal) {
            level++;
            hits = 0;
            misses = 0;
            total = 0;
            nextLevel();
        }
    }
}

nextLevel();
animate();
