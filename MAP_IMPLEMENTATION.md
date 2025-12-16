# Map Implementation Documentation

## Overview

This project uses **react-native-maps** with **OpenStreetMap** tiles for a completely free map solution that provides native map views on both iOS and Android.

## Technology Stack

- **react-native-maps**: Native map component for React Native
- **OpenStreetMap (OSM)**: Free, open-source map tiles
- **expo-location**: Location services and permissions management

## Features Implemented

### 1. Native MapView Component (`components/MapView.tsx`)

- ✅ Native map rendering on iOS and Android
- ✅ Free OpenStreetMap tiles (no API key required)
- ✅ User location tracking with permissions handling
- ✅ Custom markers with colors and callbacks
- ✅ Loading states and error handling
- ✅ Region change callbacks
- ✅ Zoom, rotate, and pitch controls
- ✅ User location circle overlay (optional)
- ✅ Fallback to default location if permission denied

### 2. Map Utilities (`utils/mapUtils.ts`)

- ✅ Distance calculation (Haversine formula)
- ✅ Distance formatting (meters/kilometers)
- ✅ Region calculations for multiple coordinates
- ✅ Coordinate boundary checking
- ✅ Random coordinate generation (for testing)

### 3. Home Screen Integration (`app/(root)/(tabs)/home.tsx`)

- ✅ Full-screen map with bottom sheet overlay
- ✅ Dynamic marker generation based on user location
- ✅ Marker press handling
- ✅ Region change tracking
- ✅ Nearby rides display

## Why OpenStreetMap?

### Advantages:

1. **Completely Free**: No API keys, no billing, no usage limits
2. **Open Source**: Community-driven, transparent
3. **Global Coverage**: Worldwide map data
4. **Native Performance**: Uses native map views, not web views
5. **No Vendor Lock-in**: Easy to switch tile providers if needed

### Alternative Tile Providers (All Free):

If you want to try different map styles, you can change the `urlTemplate` in `MapView.tsx`:

```typescript
// Current (OpenStreetMap - Default)
urlTemplate = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// OpenStreetMap Humanitarian
urlTemplate = "https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";

// CartoDB Positron (Light)
urlTemplate =
	"https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png";

// CartoDB Dark Matter
urlTemplate =
	"https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";

// Stamen Terrain
urlTemplate = "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg";

// Stamen Toner
urlTemplate = "https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png";
```

## Configuration

### Android

Already configured in:

- `android/app/src/main/AndroidManifest.xml`: Location permissions
- `package.json`: react-native-maps dependency
- `app.json`: expo-location plugin

### iOS

Will be automatically configured by Expo when building:

- Location permissions in Info.plist
- Native map framework linking

## Permissions

### Android Permissions (AndroidManifest.xml):

```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

### iOS Permissions (Info.plist):

Configured via `app.json`:

```json
{
	"expo-location": {
		"locationWhenInUsePermission": "Show current location on map."
	}
}
```

## Usage Examples

### Basic Map

```typescript
import MapViewComponent from "@/components/MapView";

<MapViewComponent showUserLocation={true} />
```

### Map with Custom Markers

```typescript
const markers = [
  {
    id: "1",
    latitude: 37.78825,
    longitude: -122.4324,
    title: "San Francisco",
    description: "Golden Gate Bridge",
    color: "#ff6b6b"
  }
];

<MapViewComponent
  showUserLocation={true}
  markers={markers}
  onMarkerPress={(marker) => console.log(marker)}
/>
```

### Map with Region Tracking

```typescript
<MapViewComponent
  showUserLocation={true}
  onRegionChange={(region) => {
    console.log('Region changed:', region);
    // Fetch nearby data based on region
  }}
/>
```

## Building the App

### Development Build

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Production Build

```bash
# Build for Android
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

## Performance Considerations

1. **Tile Caching**: react-native-maps automatically caches tiles for better performance
2. **Marker Optimization**: Limit visible markers to improve rendering performance
3. **Region Updates**: Debounce region change callbacks to avoid excessive API calls
4. **Memory Management**: Unload markers outside the visible region for large datasets

## Troubleshooting

### Map Not Showing

- Check internet connection (tiles need to download)
- Verify location permissions are granted
- Check console for errors

### Location Not Working

- Ensure location services are enabled on device
- Check app permissions in device settings
- Verify `expo-location` is properly configured

### Tiles Not Loading

- Check internet connection
- Try alternative tile providers
- Verify the URL template is correct

## Future Enhancements

Possible additions:

- [ ] Route drawing and directions
- [ ] Clustering for many markers
- [ ] Custom marker icons
- [ ] Geofencing
- [ ] Offline map support
- [ ] Search and geocoding
- [ ] Traffic layer
- [ ] Heat maps

## Resources

- [react-native-maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [OpenStreetMap Usage Policy](https://operations.osmfoundation.org/policies/tiles/)
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [Alternative Tile Providers](https://wiki.openstreetmap.org/wiki/Tile_servers)

## License

- **OpenStreetMap**: Data is © OpenStreetMap contributors, ODbL
- **react-native-maps**: MIT License
- **This Implementation**: Follow your project's license
