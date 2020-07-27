import { PerspectiveCamera } from "three";

export default function() {
	const camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		1,
		10000
	);
	camera.position.z = 1400;
	return camera;
}
