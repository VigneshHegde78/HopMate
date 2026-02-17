import 'package:flutter/material.dart';
import 'package:get/get.dart'; // Using GetX for context.mediaQuerySize
import 'package:google_fonts/google_fonts.dart';
import 'dart:async';
import 'package:maplibre_gl/maplibre_gl.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hopmate/services/current_location.dart';

import 'package:hopmate/components/map.dart';
import 'package:hopmate/screens/searchbar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  final Completer<MapLibreMapController> _mapController = Completer();
  bool _canInteractWithMap = false;

  final LocationService _locationService = LocationService();
  StreamSubscription<LatLng>? _locationStream;
  LatLng? _lastKnownUserPos;

  bool _isLoadingLocation = false;

  @override
  void initState() {
    super.initState();
    _locationService.checkPermissions();
  }

  void _fetchAndCacheUserLocation() async {
    _lastKnownUserPos = await _locationService.getCurrentLocation();
  }

  Future<void> _centerOnUser() async {
    if (_isLoadingLocation) return;

    setState(() => _isLoadingLocation = true);

    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final userLatLng = LatLng(position.latitude, position.longitude);

      // Smooth camera animation instead of instant jump
      final controller = await _mapController.future;
      controller.animateCamera(CameraUpdate.newLatLngZoom(userLatLng, 15));

      _lastKnownUserPos = userLatLng;
    } catch (e) {
      debugPrint("Error fetching location: $e");
    }

    await Future.delayed(const Duration(milliseconds: 300));
    setState(() => _isLoadingLocation = false);
  }

  void _startLiveTracking() async {
    _locationStream = _locationService.getLocationStream().listen((pos) {
      _lastKnownUserPos = pos;
    });
  }

  @override
  void dispose() {
    _locationStream?.cancel();
    super.dispose();
  }

  static const CameraPosition _nullIsland = CameraPosition(
    target: LatLng(0, 0),
    zoom: 3,
  );

  void _moveCameraToNullIsland() {
    _mapController.future.then((controller) {
      controller.animateCamera(CameraUpdate.newCameraPosition(_nullIsland));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 70.0),
        child: FloatingActionButton(
          backgroundColor: Colors.blue,
          onPressed: _isLoadingLocation ? null : _centerOnUser,
          mini: true,
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            transitionBuilder:
                (child, animation) =>
                    ScaleTransition(scale: animation, child: child),
            child:
                _isLoadingLocation
                    ? const SizedBox(
                      key: ValueKey("loading"),
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                    : const Icon(
                      Icons.my_location,
                      color: Colors.white,
                      key: ValueKey("icon"),
                    ),
          ),
        ),
      ),
      body: Stack(
        children: [
          // 🗺 Map background
          NativeMapComponent(
            onMapCreated: (controller) => _mapController.complete(controller),
            onStyleLoadedCallback: () {
              setState(() => _canInteractWithMap = true);
            },
          ),

          // 🔹 Search UI Overlay
          Positioned(
            top: 50,
            left: 20,
            right: 20,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'HOPMATE',
                  style: GoogleFonts.vinaSans(
                    fontSize: 32,
                    color: Colors.grey[800],
                    shadows: [
                      const Shadow(
                        color: Colors.white,
                        blurRadius: 2,
                        offset: Offset(1, 1),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // 🔍 Search bar widget
                CustomSearchBar(
                  onPlaceSelected: (lat, lng) async {
                    final controller = await _mapController.future;
                    controller.animateCamera(
                      CameraUpdate.newLatLngZoom(LatLng(lat, lng), 15.0),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
