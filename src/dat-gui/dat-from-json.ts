import { GUI as Dat } from "dat.gui";
import { randomHexadecimalColor } from "../canvas/planet";

const allowedFunctions: any = {
	randomHexadecimalColor
};

export class DatControls {
	[key: string]: any;
}

export default function(dat: Dat, title: string, json: any) {
	const datControls = new DatControls();
	window.datGUI[title] = datControls;

	const mainFolder = dat.addFolder(title);
	DatFromJSON(mainFolder, datControls, json);
	return mainFolder;
}

function DatFromJSON(dat: Dat, controls: DatControls, object: any) {
	for (const prop in object) {
		let value = object[prop];

		switch (value.constructor.name) {
			case "Object":
				const newFolder = dat.addFolder(prop);
				const newDatControls = new DatControls();
				controls[prop] = newDatControls;
				DatFromJSON(newFolder, newDatControls, value);
				break;
			case "Array":
				controls[prop] = value[0];
				controls[prop + ".Controller"] = dat.add(
					controls,
					prop,
					...value.slice(1)
				);
				break;
			case "Boolean":
				controls[prop] = value;
				controls[prop + ".Controller"] = dat.add(controls, prop);
				break;
			case "String":
				if (value.includes("()")) {
					let fn = allowedFunctions[value.slice(0, -2)];

					if (prop.includes("()")) {
						value = fn || "undefined";
					} else {
						value = fn();
					}
				}
				controls[prop] = value;

				if (value[0] == "#") {
					controls[prop + ".Controller"] = dat.addColor(
						controls,
						prop
					);
					break;
				}
				controls[prop + ".Controller"] = dat.add(controls, prop);
				break;
		}
	}
}
