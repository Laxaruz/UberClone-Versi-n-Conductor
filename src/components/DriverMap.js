import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';

const referenceRegion = {
  latitude: 4.711,
  longitude: -74.0721,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function DriverMap({ location, sharing, simulatedApproval }) {
  const t = useTranslation();
  const region = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  } : referenceRegion;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} accessibilityLabel={t('driverMap')}>
        {location && <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} title={t('currentLocation')} />}
      </MapView>
      <Text style={styles.caption}>{t(sharing ? simulatedApproval ? 'locationSharedDemo' : 'locationShared' : location ? 'localLocationOnly' : 'referenceMap')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 320, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  map: { flex: 1 },
  caption: { padding: 10, color: colors.muted, backgroundColor: colors.surface, textAlign: 'center' },
});
