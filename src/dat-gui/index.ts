import { GUI as Dat } from "dat.gui";
import DatFromJSON from "./dat-from-json";
import scene from "./scene.json";
import planet from "./planet.json";

export default function() {
	window.datGUI = {};
	const dat = new Dat({ width: 400 });
	const sceneGUI = DatFromJSON(dat, "Scene", scene);
	const planetGUI = DatFromJSON(dat, "Planet", planet);
	sceneGUI.open();
	planetGUI.open();
	return dat;
}
