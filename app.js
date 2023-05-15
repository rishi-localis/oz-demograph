import React, { useState } from 'react';
import { render } from 'react-dom';
import { StaticMap } from 'react-map-gl';
import DeckGL, { GeoJsonLayer } from 'deck.gl';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import {scaleThreshold} from 'd3-scale';
import {scaleLog} from 'd3-scale';

import mapboxgl from 'mapbox-gl';

// Set your mapbox token here
mapboxgl.accessToken = 'pk.eyJ1IjoicmlzaGkxMyIsImEiOiJjamlyZ2V2dGwwdXEyM3BycXp2ZzlxcmozIn0.UqtxCizQ6MsNzIajuGOpAg';

const geojsonData = require('./qld.geojson');

const INITIAL_VIEW_STATE = {
  latitude: -27.5569,
  longitude: 152.4962,
  zoom: 8,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

const colorScale = scaleLog()
.domain([10, 100, 1000, 10000])
.range([
  [255, 255, 178],
  [254, 204, 92],
  [253, 141, 60],
  [227, 26, 28]
]);

const MAP_STYLE = 'mapbox://styles/mapbox/dark-v10';

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 9, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true
});

function getTooltip({object}) {
  return (
    object && {
      html: `\
  </div> <div><b>Suburb - </b>${object.properties.SAL_NAME_2021}</div>
  </div> <div><b>LGA - </b>${object.properties.LGA_NAME_2021}</div>
  <div>${object.properties.Tot_P_P} - Total Pop</div>
  <div>${object.properties.Tot_P_M} - Total Male</div>
  <div>${object.properties.Tot_P_F} - Total Female</div>
  `
    }
  );
}

export default function App({ mapStyle = MAP_STYLE }) {

  const [effects] = useState(() => {
    const lightingEffect = new LightingEffect({ambientLight, dirLight});
    lightingEffect.shadowColor = [0, 0, 0, 0.5];
    return [lightingEffect];
  });

  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [selectedLGA, setSelectedLGA] = useState(null);
  const [filteredData, setFilteredData] = useState(geojsonData);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  

  // const handleLGADropdownChange = event => {
  //   const selectedLGA = event.target.value;
  //   setSelectedLGA(selectedLGA);

  //   // Filter the data based on the selected LGA
  //   const filteredData = {
  //     ...geojsonData,
  //     features: geojsonData.features.filter(
  //       feature => feature.properties.LGA_NAME_2021 === selectedLGA
  //     )
  //   };
  //   setFilteredData(filteredData);
  // };

  const handleLGADropdownChange = event => {
    const selectedLGA = event.target.value;
    setSelectedLGA(selectedLGA);
  
    // Filter the data based on the selected LGA
    const filteredData = {
      ...geojsonData,
      features: geojsonData.features.filter(
        feature => feature.properties.LGA_NAME_2021 === selectedLGA
      )
    };
    setFilteredData(filteredData);
  
    // Adjust the view state based on the selected LGA
    if (selectedLGA) {
      const [longitude, latitude] = filteredData.features[0].geometry.coordinates[0][0];
      setViewState(prevViewState => ({
        ...prevViewState,
        latitude,
        longitude,
        zoom: 10
      }));
    } else {
      setViewState(INITIAL_VIEW_STATE);
    }
  };
  
  

  const uniqueLGANames = [...new Set(geojsonData.features.map(feature => feature.properties.LGA_NAME_2021))];

  const layers = [
    new GeoJsonLayer({
      id: 'lga-layer',
      data: filteredData,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      getElevation: f => Math.sqrt(f.properties.Age_5_14_yr_P) * 250,
      getFillColor: f => colorScale(f.properties.Tot_P_P),
      getLineColor: [100, 100, 100, 200],
      onClick: ({ object }) => console.log(object.properties.LGA_NAME_2021)
    })
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
  <select
    value={selectedLGA}
    onChange={handleLGADropdownChange}
    style={{
      padding: '8px 12px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      backgroundColor: '#fff',
      color: '#333',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      cursor: 'pointer',
    }}
  >
    <option value="">All LGAs</option>
    {uniqueLGANames.map(name => (
      <option
        key={name}
        value={name}
        style={{ fontWeight: selectedLGA === name ? 'bold' : 'normal' }}
      >
        {name}
      </option>
    ))}
  </select>
</div>

        <DeckGL
          layers={layers}
          effects={effects}
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          getTooltip={getTooltip}
        >
          <StaticMap mapboxApiAccessToken={mapboxgl.accessToken} mapStyle={mapStyle} />
        </DeckGL>
      </div>
    </div>
  );
}

export async function renderToDOM(container) {
  render(<App />, container);
}
