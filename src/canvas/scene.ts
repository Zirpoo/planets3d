import * as THREE from "three";
import createCamera from "./camera";
import createRenderer from "./renderer";
import generatePlanet from "./planet";

export default function() {
	const scene = new THREE.Scene();
	const camera = createCamera();
	const renderer = createRenderer();
	renderer.setClearColor(window.datGUI.Scene.Color);

	const light1 = new THREE.DirectionalLight(
		window.datGUI.Scene.Lights.DirectionalLight_1.Color
	);
	const light2 = new THREE.AmbientLight(
		window.datGUI.Scene.Lights.AmbientLight_1.Color
	);
	light1.position.set(
		window.datGUI.Scene.Lights.DirectionalLight_1["Position.X"],
		window.datGUI.Scene.Lights.DirectionalLight_1["Position.Y"],
		window.datGUI.Scene.Lights.DirectionalLight_1["Position.Z"]
	);
	scene.add(light1, light2);

	const planet = generatePlanet(scene);

	render(renderer, scene, camera, () => {
		planet.onRender();
	});
	window.addEventListener("resize", () => onResize(renderer, camera));
	setDatGuiOnChangeEvents(renderer, light1, light2);
	return scene;
}

function onResize(
	renderer: THREE.WebGLRenderer,
	camera: THREE.PerspectiveCamera
) {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
}

function render(
	renderer: THREE.WebGLRenderer,
	scene: THREE.Scene,
	camera: THREE.PerspectiveCamera,
	callback?: () => void
) {
	requestAnimationFrame(() => render(renderer, scene, camera, callback));

	if (typeof callback == "function") {
		callback();
	}
	renderer.render(scene, camera);
}

function setDatGuiOnChangeEvents(
	renderer: THREE.WebGLRenderer,
	light1: THREE.DirectionalLight,
	light2: THREE.AmbientLight
) {
	window.datGUI.Scene["Color.Controller"].onChange((color: string) =>
		renderer.setClearColor(color)
	);
	window.datGUI.Scene.Lights.DirectionalLight_1[
		"Position.X.Controller"
	].onChange((x: number) => (light1.position.x = x));
	window.datGUI.Scene.Lights.DirectionalLight_1[
		"Position.Y.Controller"
	].onChange((y: number) => (light1.position.y = y));
	window.datGUI.Scene.Lights.DirectionalLight_1[
		"Position.Z.Controller"
	].onChange((z: number) => (light1.position.z = z));
	window.datGUI.Scene.Lights.DirectionalLight_1["Color.Controller"].onChange(
		(color: string) => (light1.color = new THREE.Color(color))
	);
	window.datGUI.Scene.Lights.AmbientLight_1["Color.Controller"].onChange(
		(color: string) => (light2.color = new THREE.Color(color))
	);
}
