import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function MarkerComponent({ height, width, center, zoom, title }) {
  return (
    <div style={{ height: height, width: width }}>
      <APIProvider apiKey="AIzaSyDzhASJpRuFs0t_G-lq2f7r9fTCjcpueJ8">
        <Map
          center={center}
          zoom={zoom}
          fullscreenControl={false}
          gestureHandling="none"
          zoomControl={false}
          mapId="c722c584ec5ffba3"
        ><Marker position={center} title={title} /></Map>
      </APIProvider>
    </div>
  );
}
