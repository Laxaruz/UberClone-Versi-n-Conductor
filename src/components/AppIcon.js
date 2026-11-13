import { SymbolView } from 'expo-symbols';

const symbols = {
  home: { ios: 'house', android: 'home', web: 'home' },
  person: { ios: 'person', android: 'person', web: 'person' },
  car: { ios: 'car.side', android: 'directions_car', web: 'directions_car' },
  document: { ios: 'doc.text', android: 'description', web: 'description' },
  earnings: { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
  history: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  camera: { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
  gallery: { ios: 'photo.on.rectangle', android: 'photo_library', web: 'photo_library' },
  calendar: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  chevron: { ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  pin: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  flag: { ios: 'flag', android: 'flag', web: 'flag' },
  route: { ios: 'arrow.triangle.turn.up.right.diamond', android: 'route', web: 'route' },
};

export default function AppIcon({ name, size = 22, color = '#096B65' }) {
  return <SymbolView name={symbols[name] || symbols.home} size={size} tintColor={color}
    style={{ width: size, height: size }} />;
}
