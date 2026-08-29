# GPS Coordinate Accuracy Notes

## Why wrong location can happen on the web

Web geolocation is an estimate built from GPS, Wi-Fi fingerprints, cellular triangulation, and IP fallback. Accuracy can degrade due to:
- Indoor use, tall buildings, or poor satellite visibility.
- VPN/proxy usage or weak mobile data.
- Browser permission state or stale cached location.
- Device power-saving and low-accuracy mode.

## Current mitigation implemented

The app now uses a layered strategy in public map location detection:
- High-accuracy watch first, selecting the best fix seen during the capture window.
- Fallback `getCurrentPosition` if high-accuracy watch fails or times out.
- Accuracy gate: rejects very low-precision fixes.
- Country sanity check: rejects positions outside Algeria bounds.
- Manual coordinate override remains available at all times.

## Browser and device compatibility notes

The platform is designed to run on modern versions of:
- Chrome (desktop and Android)
- Edge (desktop)
- Firefox (desktop and Android)
- Safari (iOS and macOS)

GPS behavior differences to expect:
- iOS Safari may delay high-accuracy lock indoors.
- Some Android devices return coarse location first, then refine.
- Desktop browsers may rely on Wi-Fi/IP when GPS hardware is absent.

## Add-point flow: direct GPS localization

The organiser add/edit point form now includes a direct GPS action:
- Button: "Use GPS for my location"
- Flow: high-accuracy watch first, then fallback to standard `getCurrentPosition`
- Result: form latitude/longitude are auto-filled with the detected coordinates
- Fallback: organizer can still click on map or input coordinates manually

## Algeria sanity bounds used

Approximate bounds used for a quick guard:
- Latitude: 18.8 to 37.4
- Longitude: -8.9 to 12.3

These are not legal borders, only practical product bounds to detect obvious GPS anomalies.

## Recommended user-side troubleshooting

If the app still detects a wrong place:
- Ensure browser location permission is allowed.
- Disable VPN and retry.
- Move outdoors or near a window and retry.
- Wait a few seconds for improved GPS lock.
- Use manual map pin or coordinate input as fallback.

## Future hardening ideas

- Add multi-sample median filtering over 3 to 5 readings.
- Persist a confidence score and expose it in UI.
- Add optional reverse-geocoding confirmation step before running nearby search.
- Compare movement speed between samples to reject impossible jumps.
