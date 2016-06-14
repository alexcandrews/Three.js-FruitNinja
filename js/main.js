var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(130, window.innerWidth / window.innerHeight, 0.1, 500);
var renderer = new THREE.WebGLRenderer();

var GRAVITY = .5;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
document.addEventListener('mousedown', onDocumentMouseDown, false);

var fruits = [];
var removeFruits = [];

var hits = 0;
var misses = 0;
var total = 0;
var level = 5;
var levelGoals = [{
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

function printScore() {
    if (level < levelGoals.length) {
        console.log("Hits: " + hits + "\nMisses: " + misses + "\nTotal: " + total +
            "\nGoal: " + levelGoals[level].goal + "\nLevel: " + (level + 1));
    } else {
        console.log("YOU WIN!!!");
    }
}

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
        if (fruit.position.z < -500) {
            removeFruits.push(fruit);
            misses++;
            printScore();
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
    fruit.velocity.z = Math.random() * 7 + levelGoals[level].speed;
    fruit.velocity.y = Math.random() * 10 + 10;
    fruit.velocity.x = Math.random() * fruit.velocity.z;
    fruits.push(fruit);
    scene.add(fruit);
    total++;
};

setInterval(function() {
    if (level < levelGoals.length) {
        init()
    }
}, 1000);

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
        if (hits == levelGoals[level].goal) {
            level++;
            hits = 0;
            misses = 0;
            total = 0;
        }
        printScore();
    }
}


animate();
