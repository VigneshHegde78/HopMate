import 'package:flutter/material.dart';
import 'package:maplibre_gl/maplibre_gl.dart';

class NativeMapComponent extends StatelessWidget {
  // Callbacks to notify the parent when the map is ready
  final Function(MapLibreMapController) onMapCreated;
  final VoidCallback onStyleLoadedCallback;

  const NativeMapComponent({
    super.key,
    required this.onMapCreated,
    required this.onStyleLoadedCallback,
  });

  // IMPORTANT: You must add your own API key here
  final String _maptilerApiKey = 'uDjdyhp3yDFbuNIsAb3R';

  // The starting position of the map
  static const CameraPosition kInitialPosition = CameraPosition(
    target: LatLng(19.46, 72.80), // Centered on Virar, Maharashtra
    zoom: 16.0,
  );

  @override
  Widget build(BuildContext context) {
    // We recommend the 'basic-v2' style for a clean, Uber-like look
    final styleUrl =
        'https://api.maptiler.com/maps/basic-v2/style.json?key=$_maptilerApiKey';

    // This widget now ONLY returns the map, not a whole Scaffold.
    return MapLibreMap(
      styleString: styleUrl,
      onMapCreated: onMapCreated,
      initialCameraPosition: kInitialPosition,
      onStyleLoadedCallback: onStyleLoadedCallback,
      rotateGesturesEnabled: false,
      myLocationEnabled: true, // Enables the blue dot for user location
      // Disables the compass icon which can clutter the UI
      compassEnabled: false,
    );
  }
}
