import { useEffect, useState } from "react";
import {
  APIProvider,
  Map,
  useMapsLibrary,
  useMap,
} from "@vis.gl/react-google-maps";
import axios from "axios";
const start = { lat: 23.75784288649373, lng: 90.39014465616876 };
const end = { lat: 23.722757658696015, lng: 90.39990316565954 };

export default function Gmap({
  height,
  width,
  origin,
  destination,
  travelMode,
  center,
  zoom,
}) {
  const position = {
    lat: (origin.lat + destination.lat) / 2,
    lng: (origin.lng + destination.lng) / 2,
  };

  return (
    <div style={{ height: height, width: width }}>
      <APIProvider apiKey="AIzaSyDzhASJpRuFs0t_G-lq2f7r9fTCjcpueJ8">
        <Map
          center={position}
          zoom={zoom}
          fullscreenControl={false}
          gestureHandling="none"
          zoomControl={false}
          mapId="c722c584ec5ffba3"
        >
          <Directions
            origin={origin}
            destination={destination}
            travelMode={travelMode}
          />
        </Map>
      </APIProvider>
    </div>
  );
}

const Directions = ({ origin, destination, travelMode }) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const [routes, setRoutes] = useState([]);
  const [routeIndex, setRouteIndex] = useState(0);

  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (!routesLibrary || !map) return;

    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    directionsService
      .route({
        origin: origin,
        destination: destination,
        travelMode: travelMode,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      });
  }, [directionsService, directionsRenderer]);

  useEffect(() => {
    if (!directionsRenderer) return;

    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) return null;

  return (
    <div className="absolute right-2 top-2 rounded-lg bg-gray-800 p-5 text-white">
      <p className="mb-3 text-xl">{selected.summary}</p>
      <div className="flex flex-col justify-start">
        <div className="flex gap-x-2">
          <div className="text-xlightgray"> Trip: </div>
          <div>
            {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
          </div>
        </div>
        <div className="flex gap-x-2">
          <div className="text-xlightgray">Distance: </div>
          <div>{leg.distance?.text}</div>
        </div>
        <div className="flex gap-x-2">
          <div className="text-xlightgray">Duration: </div>
          <div>{leg.duration?.text}</div>
        </div>
      </div>

      <p className="mt-6 text-xlightgray">Available Routes:</p>
      <div className="ml-2 flex flex-col">
        {routes.map((route, index) => (
          <button
            key={route.summary}
            onClick={() => setRouteIndex(index)}
            className={`${
              index === routeIndex ? "text-xyellow" : "text-white"
            } flex items-center gap-x-2 rounded text-left text-white ring-0 transition-all duration-200 hover:text-xyellow`}
          >
            <div className="h-1 w-1 rounded-full bg-white"></div>
            <div>{route.summary}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
