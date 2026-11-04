import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeaturePreview from '../components/FeaturePreview';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TripPreviewScreen from '../screens/TripPreviewScreen';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function PersonalScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('personal')} />;
}

function VehicleScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('vehicle')} />;
}

function DocumentsScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('documents')} />;
}

function EarningsScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('earnings')} />;
}

function HistoryScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('history')} />;
}

function ProfileScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('profile')} />;
}

function PaymentPreviewScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('payment')} />;
}

function RegistrationTabs() {
  const t = useTranslation();
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen name="Personal" component={PersonalScreen} options={{ title: t('personal') }} />
      <Tabs.Screen name="Vehicle" component={VehicleScreen} options={{ title: t('vehicle') }} />
      <Tabs.Screen name="Documents" component={DocumentsScreen} options={{ title: t('documents') }} />
    </Tabs.Navigator>
  );
}

function MainDrawer() {
  const t = useTranslation();
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.surface },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: t('home') }} />
      <Drawer.Screen
        name="Registration"
        component={RegistrationTabs}
        options={{ title: t('registration') }}
      />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: t('earnings') }} />
      <Drawer.Screen name="History" component={HistoryScreen} options={{ title: t('history') }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile') }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
    </Drawer.Navigator>
  );
}

function TripStack() {
  const t = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="TripPreview" component={TripPreviewScreen} options={{ title: t('trip') }} />
      <Stack.Screen
        name="PaymentPreview"
        component={PaymentPreviewScreen}
        options={{ title: t('payment') }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainDrawer" component={MainDrawer} />
      <Stack.Screen name="TripFlow" component={TripStack} />
    </Stack.Navigator>
  );
}
