import maplibregl, {
  type AddLayerObject,
  type FlyToOptions,
} from "npm:maplibre-gl";
import { Protocol } from "npm:pmtiles";

import { downloadAndSavePMTiles, getFileLoc } from "./fs.ts";
import layers from "./layers.ts";
import worldLayers from "./world_layers.ts";

const map = new maplibregl.Map({
  container: "map",
  center: [7.42661, 43.73488],
  zoom: 2,
  pitchWithRotate: false,
  style: {
    version: 8,
    glyphs: "/static/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    layers: [],
    sources: {},
  },
});

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Download and add Basemap
map.on("load", async () => {
  const url = await downloadAndSavePMTiles(
    "https://static.bpev.me/maps/world.pmtiles",
    "world.pmtiles"
  );
  map.addSource("world", {
    type: "vector",
    url: `pmtiles://${url}`,
    attribution: "Natural Earth",
  });

  for (const layer of worldLayers) {
    map.addLayer(layer);
  }
});

const loaded: { [key: string]: AddLayerObject } = {};

// Download and load regional maps
async function downloadAndAdd(name: string, loc: FlyToOptions) {
  if (name in loaded) {
    map.flyTo(loc);
    return;
  }
  try {
    const url = await downloadAndSavePMTiles(
      `https://static.bpev.me/maps/${name}.pmtiles`,
      `${name}.pmtiles`
    );
    map.addSource(name, { type: "vector", url: `pmtiles://${url}` });
    for (const layer of layers(name)) {
      map.addLayer(layer);
    }

    loaded[name] = true;
    map.flyTo(loc);
  } catch (error) {
    console.error(`Failed to download or add ${name} region:`, error);
  }
}

getFileLoc().then((val) => {
  const loc = document.getElementById("loc");
  if (loc) {
    loc.innerHTML = val;
  }
});

document.getElementById("download-monaco")?.addEventListener("click", () =>
  downloadAndAdd("monaco", {
    center: [7.42661, 43.73488],
    zoom: 12,
  })
);

document.getElementById("download-taiwan")?.addEventListener("click", () =>
  downloadAndAdd("taiwan", {
    center: [121.5987, 25.0047],
    zoom: 9,
  })
);
