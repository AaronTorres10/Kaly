export type ListingMapState = 'ready' | 'unavailable';

export type ListingMapInput = {
  latitude: number;
  longitude: number;
  label: string;
};

export function getListingMapState(latitude: number | null, longitude: number | null): ListingMapState {
  if (
    latitude === null || longitude === null ||
    !Number.isFinite(latitude) || !Number.isFinite(longitude) ||
    latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
  ) {
    return 'unavailable';
  }

  return 'ready';
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildListingMapHtml({ latitude, longitude, label }: ListingMapInput): string {
  const safeLabel = escapeHtml(label);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>html, body, #map { height: 100%; margin: 0; } .leaflet-control-attribution { font-size: 10px; }</style>
  </head>
  <body>
    <div id="map" aria-label="Mapa de ${safeLabel}"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map', { zoomControl: false }).setView([${latitude}, ${longitude}], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);
      L.marker([${latitude}, ${longitude}]).addTo(map).bindPopup('${safeLabel.replaceAll("'", "\\'")}').openPopup();
    </script>
  </body>
</html>`;
}
