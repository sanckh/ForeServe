import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function IssueReportScreen() {
  const [hole, setHole] = useState('');
  const [notes, setNotes] = useState('');

  const submit = () => {
    console.log('Issue report', { hole, notes });
    alert('Thanks! This is a placeholder.');
    setHole(''); setNotes('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Issue Report</ThemedText>
      <TextInput placeholder="Hole number" value={hole} onChangeText={setHole} style={styles.input} keyboardType="number-pad" />
      <TextInput placeholder="Notes (optional)" value={notes} onChangeText={setNotes} style={[styles.input, { height: 100 }]} multiline />
      <View style={{ height: 8 }} />
      <Button title="Attach Photo (TODO)" onPress={() => alert('Image picker TODO')} />
      <View style={{ height: 8 }} />
      <Button title="Submit" onPress={submit} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 16, flex: 1 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 },
});
