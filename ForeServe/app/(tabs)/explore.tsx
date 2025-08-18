import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore</ThemedText>
      <ThemedText>This screen is intentionally minimal.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 16, flex: 1, justifyContent: 'center' },
});
