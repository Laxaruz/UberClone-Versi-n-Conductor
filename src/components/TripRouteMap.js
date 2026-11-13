import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { colors } from '../config/theme';
import useDriverLocation from '../hooks/useDriverLocation';
import useTranslation from '../i18n/useTranslation';
import { getDrivingRoute } from '../services/routeService';

export default function TripRouteMap({ target, isFocused }) {
  const t = useTranslation();
  const map = useRef(null);
  const destination = { latitude: target?.lat, longitude: target?.lng };
  const hasDestination = Number.isFinite(destination.latitude) && Number.isFinite(destination.longitude)
    && Math.abs(destination.latitude) <= 90 && Math.abs(destination.longitude) <= 180;
  const { location, loading, error: locationError } = useDriverLocation({
    isFocused: isFocused && hasDestination, trackingEnabled: false,
  });
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);

  useEffect(() => {
    if (!location || !hasDestination) return undefined;
    let active = true;
    setRouteLoading(true);
    setRouteError(false);
    getDrivingRoute(location, destination)
      .then((result) => {
        if (active) setRoute(result);
      })
      .catch(() => {
        if (active) setRouteError(true);
      })
      .finally(() => {
        if (active) setRouteLoading(false);
      });
    return () => { active = false; };
  }, [location?.latitude, location?.longitude, destination.latitude, destination.longitude]);

  useEffect(() => {
    if (route) map.current?.fitToCoordinates(route.coordinates, {
      edgePadding: { top: 35, right: 35, bottom: 35, left: 35 },
      animated: true,
    });
  }, [route]);

  return (
    <View style={styles.container}>
      {location ? (
        <View style={styles.mapFrame}>
          <MapView ref={map} style={styles.map} initialRegion={{
            latitude: location.latitude, longitude: location.longitude,
            latitudeDelta: 0.025, longitudeDelta: 0.025,
          }} accessibilityLabel={t('tripRouteMap')}>
            <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title={t('currentLocation')} />
            {hasDestination ? <Marker coordinate={destination} title={target.address} /> : null}
            {route ? <Polyline coordinates={route.coordinates} strokeColor={colors.primary} strokeWidth={5} /> : null}
          </MapView>
        </View>
      ) : null}
      {loading ? <Text style={styles.message}>{t('locating')}</Text> : null}
      {locationError ? <Text style={styles.message}>{t(locationError)}</Text> : null}
      {!hasDestination ? <Text style={styles.message}>{t('routePointMissing')}</Text> : null}
      {routeLoading ? <Text style={styles.message}>{t('routeLoading')}</Text> : null}
      {routeError ? <Text style={styles.message}>{t('routeUnavailable')}</Text> : null}
      {route ? (
        <>
          <Text style={styles.distance}>{t('routeEstimate')}: {(route.distanceMeters / 1000).toFixed(1)} km · {Math.ceil(route.durationSeconds / 60)} min</Text>
          <Text style={styles.attribution}>{t('routeAttribution')}</Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, borderRadius: 17, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface, overflow: 'hidden' },
  mapFrame: { height: 280 },
  map: { flex: 1 },
  message: { padding: 14, color: colors.warning, lineHeight: 20 },
  distance: { paddingHorizontal: 14, paddingTop: 12, fontSize: 16, fontWeight: '700', color: colors.primary },
  attribution: { padding: 14, fontSize: 12, color: colors.muted },
});
