import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FeaturePreview from '../components/FeaturePreview';
import AppIcon from '../components/AppIcon';
import { colors } from '../config/theme';
import useTranslation from '../i18n/useTranslation';
import HomeScreen from '../screens/HomeScreen';
import HistoryDetailScreen from '../screens/HistoryDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import EarningsScreen from '../screens/EarningsScreen';
import IncomingRequestScreen from '../screens/IncomingRequestScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TripPreviewScreen from '../screens/TripPreviewScreen';
import ActiveTripScreen from '../screens/ActiveTripScreen';
import TripCompletedScreen from '../screens/TripCompletedScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import { useDriver } from '../context/DriverContext';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function PersonalScreen() {
  return <RegistrationScreen section="personal" />;
}

function VehicleScreen() {
  return <RegistrationScreen section="vehicle" />;
}

function DocumentsScreen() {
  return <RegistrationScreen section="documents" />;
}

function ProfileScreen() {
  const t = useTranslation();
  return <FeaturePreview title={t('profile')} />;
}

function RegistrationTabs() {
  const t = useTranslation();
  const { showRegistrationErrors } = useDriver();
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.muted, tabBarStyle: { borderTopColor: colors.border, paddingTop: 8 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
      <Tabs.Screen name="Personal" component={PersonalScreen} options={{ title: t('personal'),
        tabBarIcon: ({ color }) => <AppIcon name="person" color={color} size={23} /> }} listeners={{ blur: showRegistrationErrors }} />
      <Tabs.Screen name="Vehicle" component={VehicleScreen} options={{ title: t('vehicle'),
        tabBarIcon: ({ color }) => <AppIcon name="car" color={color} size={23} /> }} listeners={{ blur: showRegistrationErrors }} />
      <Tabs.Screen name="Documents" component={DocumentsScreen} options={{ title: t('documents'),
        tabBarIcon: ({ color }) => <AppIcon name="document" color={color} size={23} /> }} listeners={{ blur: showRegistrationErrors }} />
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
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: t('home'),
        drawerIcon: ({ color }) => <AppIcon name="home" color={color} /> }} />
      <Drawer.Screen
        name="Registration"
        component={RegistrationTabs}
        options={{ title: t('registration'), drawerIcon: ({ color }) => <AppIcon name="person" color={color} /> }}
      />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: t('earnings'),
        drawerIcon: ({ color }) => <AppIcon name="earnings" color={color} /> }} />
      <Drawer.Screen name="History" component={HistoryScreen} options={{ title: t('history'),
        drawerIcon: ({ color }) => <AppIcon name="history" color={color} /> }} />
      <Drawer.Screen name="Payment" component={PaymentScreen} options={{ title: t('payment'),
        drawerIcon: ({ color }) => <AppIcon name="payment" color={color} /> }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile'),
        drawerIcon: ({ color }) => <AppIcon name="person" color={color} /> }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings'),
        drawerIcon: ({ color }) => <AppIcon name="settings" color={color} /> }} />
    </Drawer.Navigator>
  );
}

function TripStack() {
  const t = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text }}>
      <Stack.Screen name="IncomingRequest" component={IncomingRequestScreen} options={{ title: t('incomingRequest') }} />
      <Stack.Screen name="TripPreview" component={TripPreviewScreen} options={{ title: t('trip') }} />
      <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} options={{ title: t('trip') }} />
      <Stack.Screen name="TripCompleted" component={TripCompletedScreen} options={{ title: t('tripSummary') }} />
      <Stack.Screen
        name="PaymentPreview"
        component={PaymentScreen}
        options={{ title: t('payment') }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const t = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainDrawer" component={MainDrawer} />
      <Stack.Screen name="TripFlow" component={TripStack} />
      <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen}
        options={{ headerShown: true, title: t('historyDetail'), headerBackTitle: t('history'), headerTintColor: colors.text }} />
    </Stack.Navigator>
  );
}
