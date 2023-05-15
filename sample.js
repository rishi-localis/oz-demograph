import React, { useState, useEffect } from 'react';
import { DeckGL, GeoJsonLayer } from 'deck.gl';
import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, BarSeries } from 'react-vis';

function App() {
  const [data, setData] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);

  useEffect(() => {
    // Load the GeoJSON data from the local system
    fetch('/path/to/geojson/file.json')
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
      })
      .catch(error => console.error(error));
  }, []);

  const chartData = data ? data.features.map(feature => ({
    x: feature.properties.LGA_NAME_2021,
    y: feature.properties.Tot_P_P
  })) : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px' }}>
      <div style={{ position: 'relative' }}>
        <DeckGL
          width={800}
          height={600}
          controller={true}
          initialViewState={{
            longitude: 0,
            latitude: 0,
            zoom: 3
          }}
        >
          <GeoJsonLayer
            id='geojson-layer'
            data={data}
            getFillColor={[255, 0, 0]}
            pickable={true}
            onHover={({ object }) => setHoveredObject(object)}
          />
        </DeckGL>
      </div>
      <div style={{ overflow: 'auto' }}>
        <XYPlot width={250} height={300} xType='ordinal'>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis />
          <YAxis />
          <BarSeries data={chartData} />
        </XYPlot>
      </div>
    </div>
  );
}

export default App;
