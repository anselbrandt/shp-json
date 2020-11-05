var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const shapefile = require("shapefile");
const fs = require("fs").promises;
const proj4 = require("proj4");
const fixutf8 = require("fix-utf8");
const routesProj = "./src/lignes.prj";
const routesShp = "./src/lignes.shp";
const routes = () => __awaiter(this, void 0, void 0, function* () {
    const proj = yield fs.readFile(routesProj, "utf-8");
    const latLong = (pts) => proj4(proj).inverse(pts);
    const geojson = yield shapefile.read(routesShp);
    const bbox = geojson.bbox;
    const features = geojson.features;
    const newFeatures = features.map((entry) => {
        const feature = entry;
        const newCoords = entry.geometry.coordinates.map((coords) => latLong(coords).map((pt) => +pt.toFixed(5)));
        feature.geometry.coordinates = newCoords;
        const fixedName = fixutf8(feature.properties.route_name);
        feature.properties.route_name = fixedName;
        const fixedHead = fixutf8(feature.properties.headsign);
        feature.properties.headsign = fixedHead;
        return feature;
    });
    yield fs.writeFile("routes.json", JSON.stringify(newFeatures));
    console.log("done");
});
const stopsProj = "./src/stops.prj";
const stopsShp = "./src/stops.shp";
const stops = () => __awaiter(this, void 0, void 0, function* () {
    const proj = yield fs.readFile(stopsProj, "utf-8");
    const latLong = (pts) => proj4(proj).inverse(pts);
    const geojson = yield shapefile.read(stopsShp);
    const bbox = geojson.bbox;
    const features = geojson.features;
    const newFeatures = features.map((entry) => {
        const feature = entry;
        const newCoords = latLong(entry.geometry.coordinates).map((pt) => +pt.toFixed(5));
        feature.geometry.coordinates = newCoords;
        feature.properties.stop_name = fixutf8(feature.properties.stop_name);
        return feature;
    });
    yield fs.writeFile("stops.json", JSON.stringify(newFeatures));
    console.log("done");
});
const filter = ["46, 55"];
const read = () => __awaiter(this, void 0, void 0, function* () {
    console.log("reading file");
    const file = yield fs.readFile("stops.json");
    const json = yield JSON.parse(file);
    const stops = json.filter((stop) => {
        const routes = stop.properties.route_id;
        if (routes !== null) {
            const routesArray = routes.split(",");
            return routesArray.some((route) => filter.includes(route));
        }
    });
    console.log(stops);
});
const bikeFilter = [4];
const readBikePaths = () => __awaiter(this, void 0, void 0, function* () {
    console.log("reading file");
    const file = yield fs.readFile("bikepaths.json");
    const json = yield JSON.parse(file);
    const types = json.features.map((feature) => {
        const type = feature.properties.TYPE_VOIE2;
        console.log(type);
        return type;
    });
    console.log("done");
});
readBikePaths().catch((error) => console.error(error));
//# sourceMappingURL=index.js.map