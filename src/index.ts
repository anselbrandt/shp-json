const shapefile = require("shapefile");
const fs = require("fs").promises;
const proj4 = require("proj4");
const fixutf8 = require("fix-utf8");

const routesProj = "./src/lignes.prj";
const routesShp = "./src/lignes.shp";

const routes = async () => {
  const proj = await fs.readFile(routesProj, "utf-8");
  const latLong = (pts: any) => proj4(proj).inverse(pts);
  const geojson = await shapefile.read(routesShp);
  const bbox = geojson.bbox;
  const features = geojson.features;
  const newFeatures = features.map((entry: any) => {
    const feature = entry;
    const newCoords = entry.geometry.coordinates.map((coords: any) =>
      latLong(coords).map((pt: any) => +pt.toFixed(5))
    );
    feature.geometry.coordinates = newCoords;
    const fixedName = fixutf8(feature.properties.route_name);
    feature.properties.route_name = fixedName;
    const fixedHead = fixutf8(feature.properties.headsign);
    feature.properties.headsign = fixedHead;
    return feature;
  });
  await fs.writeFile("routes.json", JSON.stringify(newFeatures));
  console.log("done");
};

// routes().catch((error) => console.error(error));

const stopsProj = "./src/stops.prj";
const stopsShp = "./src/stops.shp";

const stops = async () => {
  const proj = await fs.readFile(stopsProj, "utf-8");
  const latLong = (pts: any) => proj4(proj).inverse(pts);
  const geojson = await shapefile.read(stopsShp);
  const bbox = geojson.bbox;
  const features = geojson.features;
  const newFeatures = features.map((entry: any) => {
    const feature = entry;
    const newCoords = latLong(entry.geometry.coordinates).map(
      (pt: any) => +pt.toFixed(5)
    );
    feature.geometry.coordinates = newCoords;
    feature.properties.stop_name = fixutf8(feature.properties.stop_name);
    return feature;
  });
  await fs.writeFile("stops.json", JSON.stringify(newFeatures));
  console.log("done");
};

// stops().catch((error) => console.error(error));
const filter = ["46, 55"];

const read = async () => {
  console.log("reading file");
  const file = await fs.readFile("stops.json");
  const json = await JSON.parse(file);
  const stops = json.filter((stop) => {
    const routes = stop.properties.route_id;
    if (routes !== null) {
      const routesArray = routes.split(",");
      return routesArray.some((route) => filter.includes(route));
    }
  });
  console.log(stops);
};

// read().catch((error) => console.error(error));

const bikeFilter = [4];

const readBikePaths = async () => {
  console.log("reading file");
  const file = await fs.readFile("bikepaths.json");
  const json = await JSON.parse(file);
  // const paths = json.features.filter((path) => {
  //   const types = path.properties.route_id;
  //   if (types !== null) {
  //     const typesArray = types.split(",");
  //     return typesArray.some((type) => bikefilter.includes(type));
  //   }
  // });
  const types = json.features.map((feature) => {
    const type = feature.properties.TYPE_VOIE2;
    console.log(type);
    return type;
  });
  console.log("done");
};

readBikePaths().catch((error) => console.error(error));
