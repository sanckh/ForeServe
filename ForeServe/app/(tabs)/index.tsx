import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">ForeServe</ThemedText>
      <ThemedText>Start by selecting your course.</ThemedText>
      <Link href="/(tabs)/course-select" style={{ color: '#1e90ff', marginTop: 8 }}>Go to Course</Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8, padding: 16, flex: 1, justifyContent: 'center' },
});
