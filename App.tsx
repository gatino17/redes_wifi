import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Network = {
  ssid: string;
  signal: number;
  channel: number;
  security: string;
  status: string;
  connected?: boolean;
};

const initialNetworks: Network[] = [
  { ssid: 'MiFibra_5G', signal: 87, channel: 36, security: 'WPA2', status: 'Excelente', connected: true },
  { ssid: 'Vecino-Plus', signal: 62, channel: 11, security: 'WPA2', status: 'Regular' },
  { ssid: 'Casa_2.4', signal: 74, channel: 1, security: 'WPA3', status: 'Buena' },
  { ssid: 'OfficeWiFi', signal: 48, channel: 149, security: 'WPA2', status: 'Débil' },
];

const getSignalTone = (signal: number) => {
  if (signal >= 80) return '#34d399';
  if (signal >= 60) return '#fbbf24';
  return '#f87171';
};

const getStatusText = (signal: number) => {
  if (signal >= 80) return 'Excelente';
  if (signal >= 60) return 'Buena';
  if (signal >= 45) return 'Regular';
  return 'Débil';
};

export default function App() {
  const [networks, setNetworks] = useState<Network[]>(initialNetworks);
  const [scanning, setScanning] = useState(false);

  const connectedNetwork = useMemo(
    () => networks.find((network) => network.connected) ?? networks[0],
    [networks],
  );

  const avgSignal = useMemo(
    () => Math.round(networks.reduce((sum, network) => sum + network.signal, 0) / networks.length),
    [networks],
  );

  const bestNetwork = useMemo(
    () => [...networks].sort((a, b) => b.signal - a.signal)[0],
    [networks],
  );

  const keyMetrics = [
    { label: 'Señal', value: `${avgSignal}%`, tint: '#34d399' },
    { label: 'Canal', value: `${connectedNetwork?.channel ?? 36}`, tint: '#60a5fa' },
    { label: 'Seguridad', value: connectedNetwork?.security ?? 'WPA2', tint: '#fbbf24' },
    { label: 'Latencia', value: `${Math.max(10, 72 - avgSignal)} ms`, tint: '#f472b6' },
  ];

  const recommendation = useMemo(() => {
    if (!bestNetwork) return 'No hay redes disponibles.';

    if (bestNetwork.signal >= 80) {
      return 'La red principal está en un nivel muy sólido. Mantén la conexión actual y revisa solo interferencias si el rendimiento cae.';
    }

    if (bestNetwork.signal >= 60) {
      return 'La señal es aceptable. Intenta cambiar a un canal menos saturado o mueve el router para reducir pérdidas.';
    }

    return 'La red está débil. Recomendado mover el equipo cerca del router o cambiar la frecuencia a 5 GHz si es posible.';
  }, [bestNetwork]);

  const handleScan = () => {
    setScanning(true);

    setTimeout(() => {
      setNetworks((current) =>
        current.map((network, index) => {
          const delta = index === 0 ? 2 : index === 3 ? -5 : 4;
          const nextSignal = Math.max(22, Math.min(95, network.signal + delta + Math.round(Math.random() * 8) - 4));

          return {
            ...network,
            signal: nextSignal,
            status: getStatusText(nextSignal),
            connected: index === 0,
          };
        }),
      );

      setScanning(false);
    }, 900);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />

      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Wi‑Fi Monitor</Text>
        <Text style={styles.title}>Revisión de red</Text>
        <Text style={styles.subtitle}>{connectedNetwork?.ssid ?? 'Sin red'} • Conectado</Text>
      </View>

      <View style={styles.metricsGrid}>
        {keyMetrics.map((metric) => (
          <View key={metric.label} style={[styles.metricCard, { borderColor: metric.tint }]}> 
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={[styles.metricValue, { color: metric.tint }]}>{metric.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Redes cercanas</Text>
        <Pressable style={styles.button} onPress={handleScan} disabled={scanning}>
          {scanning ? <ActivityIndicator color="#082f49" /> : <Text style={styles.buttonText}>Escanear</Text>}
        </Pressable>
      </View>

      {networks.map((network) => {
        const signalColor = getSignalTone(network.signal);

        return (
          <View key={network.ssid} style={styles.networkCard}>
            <View style={styles.networkHeader}>
              <Text style={styles.networkName}>{network.ssid}</Text>
              <Text
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${signalColor}22`, borderColor: `${signalColor}88` },
                ]}
              >
                <Text style={{ color: signalColor }}>{network.status}</Text>
              </Text>
            </View>

            <View style={styles.networkStats}>
              <Text style={styles.metaText}>Señal: {network.signal}%</Text>
              <Text style={styles.metaText}>Canal: {network.channel}</Text>
              <Text style={styles.metaText}>Seguridad: {network.security}</Text>
            </View>

            <View style={styles.signalBarBackground}>
              <View
                style={[
                  styles.signalBarFill,
                  { width: `${network.signal}%`, backgroundColor: signalColor },
                ]}
              />
            </View>
          </View>
        );
      })}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Recomendación</Text>
        <Text style={styles.summaryText}>{recommendation}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 50,
    backgroundColor: '#06141f',
    minHeight: '100%',
  },
  headerCard: {
    backgroundColor: '#102a3a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#1e3f57',
  },
  eyebrow: {
    color: '#8ec5ff',
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#0d1d2d',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#38bdf8',
    minWidth: 98,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#082f49',
    fontWeight: '700',
  },
  networkCard: {
    backgroundColor: '#0d1d2d',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e3a4f',
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  networkName: {
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  networkStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 6,
  },
  signalBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#132b3c',
    borderRadius: 999,
    overflow: 'hidden',
  },
  signalBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  summaryCard: {
    marginTop: 10,
    backgroundColor: '#102a3a',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e3f57',
  },
  summaryTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryText: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 20,
  },
});
