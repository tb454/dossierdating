import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet } from 'react-native';

export default function App() {
  const [stats, setStats] = useState({ users: 0, dates: 0, reviews: 0 });
  const API_BASE = 'http://localhost:8000';

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/dossier/stats`);
      const json = await res.json();
      setStats(json);
    } catch (e) {
      console.error(e);
    }
  };

  const simulateSample = async () => {
    const r1 = await fetch(`${API_BASE}/dossier/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'SampleA' }),
    });
    const { id: id1 } = await r1.json();
    const r2 = await fetch(`${API_BASE}/dossier/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'SampleB' }),
    });
    const { id: id2 } = await r2.json();
    const rd = await fetch(`${API_BASE}/dossier/create_date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1: id1, user2: id2 }),
    });
    const { date_id } = await rd.json();
    await fetch(`${API_BASE}/dossier/submit_review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date_id,
        scores: { first_impression: 5 },
        comment: 'Great date!',
      }),
    });
    fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dossier Dating Bot Stats</Text>
      <View style={styles.stats}>
        <Text>Users: {stats.users}</Text>
        <Text>Dates: {stats.dates}</Text>
        <Text>Reviews: {stats.reviews}</Text>
      </View>
      <Button title="Run Sample Simulation" onPress={simulateSample} />
      <Button title="Refresh Stats" onPress={fetchStats} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
  stats: { marginVertical: 20 },
});
