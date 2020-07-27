import createScene from "./canvas/scene";
import { DatControls } from "./dat-gui/dat-from-json";
import createDat from "./dat-gui/index";
import "./main.css";

declare global {
	interface Window {
		datGUI: {
			[key: string]: DatControls;
		};
	}
}

const scenes = [{ dat: createDat(), scene: createScene() }];
