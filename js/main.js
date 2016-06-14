var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(130, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();

var GRAVITY = .5;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);
document.addEventListener( 'mousedown', onDocumentMouseDown, false );

var fruits = [];

var hits = 0;

function gravitate(fruit) {
    fruit.velocity.y -= GRAVITY;
}

function render() {
    var removeFruits = [];
    requestAnimationFrame(render);

    for (fruit of fruits) {
        fruit.position.x += fruit.velocity.x;
        if (fruit.position.y < 0) {
            fruit.velocity.y *= -1;
        }
        fruit.position.y += fruit.velocity.y;
        fruit.position.z -= fruit.velocity.z;
        gravitate(fruit);
        fruit.rotation.x += .1;
        fruit.rotation.y += .1;
        if (fruit.position.z < -1000) {
            removeFruits.push(fruit);
        }
    }
    for (fruit of removeFruits) {
        fruits.splice(fruits.indexOf(fruit), 1);
        scene.remove(fruit);
    }

    renderer.render(scene, camera);
};

function fruit() {
    var geometry = new THREE.SphereGeometry(80, 5, 1);
    var material = new THREE.MeshNormalMaterial({});
    var fruit = new THREE.Mesh(geometry, material);
    fruit.position.x = Math.random() * (camera.fov / 4) + (camera.fov / 4);
    fruit.position.y = 0;
    fruit.position.z = -Math.random() * camera.fov * .1;
    fruit.velocity = {};
    fruit.velocity.x = 0;
    fruit.velocity.y = Math.random() * 10 + 10;
    fruit.velocity.z = 5;
    fruits.push(fruit);
    scene.add(fruit);
};

function onDocumentMouseDown( event ) {
	console.log("fruity");

	var mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(scene.children);

	console.log(intersects);
	if (intersects.length > 0) {
		scene.remove(intersects[0].object);
	}
}

setInterval(fruit, 1000);

render();
