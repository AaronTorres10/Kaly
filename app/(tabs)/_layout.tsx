import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

const colors = { active: '#173C38', muted: '#87938C' };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.active,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: Platform.OS === 'ios' ? 0 : 4 },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 86 : 66,
          paddingTop: 9,
          borderTopWidth: 1,
          borderTopColor: '#EDF0EC',
          backgroundColor: '#FFFDF9',
        },
        tabBarIcon: ({ color, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: focused ? 'home' : 'home-outline',
            explore: focused ? 'compass' : 'compass-outline',
            saved: focused ? 'heart' : 'heart-outline',
            profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={23} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="saved" options={{ title: 'Guardados' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
