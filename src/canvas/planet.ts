import {
	SphereGeometry,
	Mesh,
	MeshLambertMaterial,
	Vector3,
	Scene
} from "three";

export interface Planet {
	rotate: (x?: number, y?: number, z?: number) => void;
	rotateX: (x: number) => void;
	rotateY: (y: number) => void;
	rotateZ: (z: number) => void;
	delete: () => void;
	updateMeshGeometry: (mapId: keyof typeof PlanetMeshIndexName) => void;
	updateMeshMaterial: (mapId: keyof typeof PlanetMeshIndexName) => void;
	onRender: () => void;
	meshes: Mesh<SphereGeometry, MeshLambertMaterial>[];
	geometries: [
		SphereGeometry,
		SphereGeometry,
		SphereGeometry,
		Vector3[],
		Vector3[],
		Vector3[]
	];
}

export enum PlanetMeshIndexName {
	"Ocean",
	"Ground",
	"HighGround"
}

export default function generatePlanet(scene: Scene) {
	const [geometries, meshes] = createPlanet();
	scene.add(...meshes);

	const planet = {
		rotate: (x = 0, y = 0, z = 0) => {
			if (x > 0) {
				planet.rotateX(x);
			}
			if (y > 0) {
				planet.rotateY(y);
			}
			if (z > 0) {
				planet.rotateZ(z);
			}
		},
		rotateX: (x: number) => planet.meshes.forEach(m => (m.rotation.x += x)),
		rotateY: (y: number) => planet.meshes.forEach(m => (m.rotation.y += y)),
		rotateZ: (z: number) => planet.meshes.forEach(m => (m.rotation.z += z)),
		delete: () => scene.remove(...planet.meshes),
		updateMeshGeometry: (meshName: keyof typeof PlanetMeshIndexName) => {
			const updateIndex = PlanetMeshIndexName[meshName];
			const [geometry] = createSphereGeometry(
				window.datGUI.Planet.Geometry[meshName].Radius,
				window.datGUI.Planet.Geometry[meshName]["Segments.Width"],
				window.datGUI.Planet.Geometry[meshName]["Segments.Height"],
				window.datGUI.Planet.Geometry[meshName][
					"Vertices.Position.Random"
				]
			);
			planet.meshes[updateIndex].geometry = geometry;
		},
		updateMeshMaterial: (meshName: keyof typeof PlanetMeshIndexName) => {
			const updateIndex = PlanetMeshIndexName[meshName];
			planet.meshes[updateIndex].material = new MeshLambertMaterial({
				color: window.datGUI.Planet.Material[meshName].Color
			});
		},
		onRender: () => {
			planet.rotate(
				window.datGUI.Planet.Renderer["Rotation.X"],
				window.datGUI.Planet.Renderer["Rotation.Y"],
				window.datGUI.Planet.Renderer["Rotation.Z"]
			);
		},
		meshes,
		geometries
	};
	setDatGuiOnChangeEvents(planet);
	return planet;
}

function getRandomAxis() {
	const axis = ["x", "y", "z"] as const;
	const random = Math.floor(Math.random() * 3);
	return axis[random];
}

function randomiseVertices(
	vertices: Vector3[],
	axisValue: number | (() => number)
) {
	for (const vertex of vertices) {
		const axis = getRandomAxis();
		const value = typeof axisValue == "number" ? axisValue : axisValue();
		vertex[axis] = vertex[axis] + value;
	}
	return vertices;
}

export function randomHexadecimalColor(): string {
	const hex = Math.floor(Math.random() * 16777215).toString(16);

	if (hex.length != 6) {
		return randomHexadecimalColor();
	}
	return "#" + hex;
}

export function createPlanet() {
	// COLOR FOR EARTH | ocean: #76acda ground: #b8b658 highGround: #e3c97f
	const geometries = createPlanetGeometry();
	const meshes = [
		new Mesh(
			geometries[0],
			new MeshLambertMaterial({
				color: window.datGUI.Planet.Material.Ocean.Color
			})
		),
		new Mesh(
			geometries[1],
			new MeshLambertMaterial({
				color: window.datGUI.Planet.Material.Ground.Color
			})
		),
		new Mesh(
			geometries[2],
			new MeshLambertMaterial({
				color: window.datGUI.Planet.Material.HighGround.Color
			})
		)
	];
	return [geometries, meshes] as const;
}

export function createPlanetGeometry(): [
	SphereGeometry,
	SphereGeometry,
	SphereGeometry,
	Vector3[],
	Vector3[],
	Vector3[]
] {
	const [ocean, defaultOceanVertices] = createSphereGeometry(
		window.datGUI.Planet.Geometry.Ocean.Radius,
		window.datGUI.Planet.Geometry.Ocean["Segments.Width"],
		window.datGUI.Planet.Geometry.Ocean["Segments.Height"],
		window.datGUI.Planet.Geometry.Ocean["Vertices.Position.Random"]
	);
	const [ground, defaultGroundVertices] = createSphereGeometry(
		window.datGUI.Planet.Geometry.Ground.Radius,
		window.datGUI.Planet.Geometry.Ground["Segments.Width"],
		window.datGUI.Planet.Geometry.Ground["Segments.Height"],
		window.datGUI.Planet.Geometry.Ground["Vertices.Position.Random"]
	);
	const [highGround, defaultHighGroundVertices] = createSphereGeometry(
		window.datGUI.Planet.Geometry.HighGround.Radius,
		window.datGUI.Planet.Geometry.HighGround["Segments.Width"],
		window.datGUI.Planet.Geometry.HighGround["Segments.Height"],
		window.datGUI.Planet.Geometry.HighGround["Vertices.Position.Random"]
	);
	return [
		ocean,
		ground,
		highGround,
		defaultOceanVertices,
		defaultGroundVertices,
		defaultHighGroundVertices
	];
}

export function createSphereGeometry(
	radius: number,
	widthSegments: number,
	heightSegments: number,
	randomVerticesPosition: number
) {
	const geometry = new SphereGeometry(radius, widthSegments, heightSegments);
	geometry.computeFlatVertexNormals();
	const defaultGeometryVertices = geometry.vertices.slice();

	if (randomVerticesPosition > 0) {
		randomiseVertices(
			geometry.vertices,
			() => Math.random() * randomVerticesPosition
		);
	}
	return [geometry, defaultGeometryVertices] as const;
}

function setDatGuiOnChangeEvents(planet: Planet) {
	// WARNING: updateMeshGeometry on each Planet.Geometry values
	for (const name in window.datGUI.Planet.Geometry) {
		const geometryName = name as keyof typeof PlanetMeshIndexName;

		for (const key in window.datGUI.Planet.Geometry.Ocean) {
			if (key.includes(".Controller")) {
				window.datGUI.Planet.Geometry[name][key].onChange(() =>
					planet.updateMeshGeometry(geometryName)
				);
			}
		}
	}
	for (const name in window.datGUI.Planet.Material) {
		const materialName = name as keyof typeof PlanetMeshIndexName;
		window.datGUI.Planet.Material[name]["Color.Controller"].onChange(() =>
			planet.updateMeshMaterial(materialName)
		);
	}
}
