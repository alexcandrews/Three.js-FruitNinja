var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(130, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
var GRAVITY = .5;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var fruits = [];

function gravitate(fruit){
	fruit.velocity.y -= GRAVITY;
}

function render() {
    requestAnimationFrame(render);

    for (fruit of fruits) {
		fruit.position.x += fruit.velocity.x;
		fruit.position.y += fruit.velocity.y;
		fruit.position.z -= fruit.velocity.z;
		gravitate(fruit);
        fruit.rotation.x += .1;
        fruit.rotation.y += .1;
    }

    renderer.render(scene, camera);
};

function fruit() {
    var geometry = new THREE.SphereGeometry(camera.fov * .1, 5, 1);
    var material = new THREE.MeshNormalMaterial({});
    var fruit = new THREE.Mesh(geometry, material);
	fruit.position.x = Math.random() * (camera.fov / 2);
	fruit.position.x *= Math.random() < .5 ?  -1 : 1;
	fruit.position.y = -camera.fov / 2;
	fruit.position.z = -Math.random() * camera.fov * .1;
	fruit.velocity = {};
	fruit.velocity.x = 0;
	fruit.velocity.y = Math.random() * 10 + 10;
	fruit.velocity.z = 5;
	console.log(fruit);
    fruits.push(fruit);
    scene.add(fruit);
};

setInterval(fruit, 1000);

render();
