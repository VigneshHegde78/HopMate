import Mapbox from "@rnmapbox/maps";
import React from "react";

Mapbox.setAccessToken("<YOUR_ACCESSTOKEN>");

const MapComponent = () => {
	return <Mapbox.MapView />;
};

export default MapComponent;
