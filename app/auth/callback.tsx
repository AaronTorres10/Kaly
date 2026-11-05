import { StyleSheet, Text, View } from 'react-native';

export default function AuthCallbackScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Completando el acceso…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: '#FCFBF8', flex: 1, justifyContent: 'center' },
  text: { color: '#214E4A', fontSize: 16 },
});
