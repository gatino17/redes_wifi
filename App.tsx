import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Device = {
  id: number;
  name: string;
  ip: string;
  mac: string;
  vendor: string;
  type: string;
  risk: 'Bajo' | 'Medio' | 'Alto';
  status: 'Activo' | 'Inactivo';
};

type ScanStep = 'idle' | 'scanning' | 'done';

const currentNetwork = {
  ssid: 'MiFibra_5G',
  bssid: 'A8:7C:7A:2F:AA:41',
  channel: 36,
  band: '5 GHz',
  security: 'WPA2',
  signal: 88,
  ip: '192.168.1.18',
  gateway: '192.168.1.1',
  dns: '8.8.8.8',
};

const seedDevices: Device[] = [
  { id: 1, name: 'MiPhone', ip: '192.168.1.18', mac: 'A4:4E:31:7D:FA:21', vendor: 'Apple', type: 'Celular', risk: 'Bajo', status: 'Activo' },
  { id: 2, name: 'Router Principal', ip: '192.168.1.1', mac: 'B8:27:EB:4D:5A:8A', vendor: 'TP-Link', type: 'Router', risk: 'Bajo', status: 'Activo' },
  { id: 3, name: 'TV-Salon', ip: '192.168.1.30', mac: '80:7D:3A:3A:00:8F', vendor: 'Samsung', type: 'Smart TV', risk: 'Medio', status: 'Activo' },
  { id: 4, name: 'Laptop-Guest', ip: '192.168.1.45', mac: 'E8:6A:64:22:AB:EC', vendor: 'Intel', type: 'Laptop', risk: 'Medio', status: 'Inactivo' },
  { id: 5, name: 'Dispositivo desconocido', ip: '192.168.1.66', mac: 'BC:FF:4D:18:92:7F', vendor: 'Desconocido', type: 'IoT', risk: 'Alto', status: 'Activo' },
  { id: 6, name: 'ESP32-Workshop', ip: '192.168.1.77', mac: '24:62:AB:91:2E:84', vendor: 'Espressif', type: 'IoT', risk: 'Medio', status: 'Activo' },
];

const getSignalTone = (signal: number) => {
  if (signal >= 80) return '#34d399';
  if (signal >= 60) return '#fbbf24';
  return '#f87171';
};

const getRiskTone = (risk: Device['risk']) => {
  if (risk === 'Bajo') return '#34d399';
  if (risk === 'Medio') return '#fbbf24';
  return '#f87171';
};

export default function App() {
  const [devices, setDevices] = useState<Device[]>(seedDevices);
  const [scanStep, setScanStep] = useState<ScanStep>('idle');

  const signalColor = useMemo(() => getSignalTone(currentNetwork.signal), []);

  const riskSummary = useMemo(() => {
    const counts = { Bajo: 0, Medio: 0, Alto: 0 };
    devices.forEach((device) => {
      counts[device.risk] += 1;
    });
    return counts;
  }, [devices]);

  const handleScan = () => {
    setScanStep('scanning');

    setTimeout(() => {
      setDevices((previous) =>
        previous.map((device, index) => {
          const shouldToggle = index === 0 || index === previous.length - 1;
          const nextStatus = shouldToggle && Math.random() > 0.48 ? 'Inactivo' : device.status;
          const nextRisk = index === previous.length - 1 ? 'Alto' : device.risk;

          return {
            ...device,
            status: nextStatus,
            risk: nextRisk,
          };
        }),
      );

      setScanStep('done');
    }, 1200);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />

      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Escaneo de red</Text>
        <Text style={styles.title}>{currentNetwork.ssid}</Text>
        <Text style={styles.subtitle}>BSSID {currentNetwork.bssid}</Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Señal</Text>
          <Text style={[styles.metricValue, { color: signalColor }]}>{currentNetwork.signal}%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Canal</Text>
          <Text style={styles.metricValue}>{currentNetwork.channel}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Seguridad</Text>
          <Text style={styles.metricValue}>{currentNetwork.security}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Banda</Text>
          <Text style={styles.metricValue}>{currentNetwork.band}</Text>
        </View>
      </View>

      <View style={styles.scanCard}>
        <View style={styles.scanHeader}>
          <Text style={styles.sectionTitle}>Análisis activo</Text>
          <Pressable style={styles.button} onPress={handleScan} disabled={scanStep === 'scanning'}>
            {scanStep === 'scanning' ? <ActivityIndicator color="#071b2d" /> : <Text style={styles.buttonText}>Escanear</Text>}
          </Pressable>
        </View>

        <View style={styles.scanStatusRow}>
          <Text style={styles.scanStatusLabel}>Estado:</Text>
          <Text style={styles.scanStatusValue}>
            {scanStep === 'idle' ? 'Listo para escanear' : scanStep === 'scanning' ? 'Analizando red...' : 'Escaneo completado'}
          </Text>
        </View>
      </View>

      <View style={styles.riskSummaryRow}>
        <View style={styles.riskChip}><Text style={styles.riskText}>Bajo: {riskSummary.Bajo}</Text></View>
        <View style={styles.riskChip}><Text style={styles.riskText}>Medio: {riskSummary.Medio}</Text></View>
        <View style={styles.riskChip}><Text style={styles.riskText}>Alto: {riskSummary.Alto}</Text></View>
      </View>

      <View style={styles.deviceListHeader}>
        <Text style={styles.sectionTitle}>Dispositivos en la red</Text>
      </View>

      {devices.map((device) => (
        <View key={device.id} style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <Text style={[styles.riskBadge, { backgroundColor: `${getRiskTone(device.risk)}22`, color: getRiskTone(device.risk) }]}>{device.risk}</Text>
          </View>

          <Text style={styles.deviceMeta}>IP: {device.ip}</Text>
          <Text style={styles.deviceMeta}>MAC: {device.mac}</Text>
          <Text style={styles.deviceMeta}>Fabricante: {device.vendor}</Text>
          <Text style={styles.deviceMeta}>Tipo: {device.type}</Text>

          <View style={styles.footerRow}>
            <Text style={styles.deviceMeta}>Estado: {device.status}</Text>
            <Text style={styles.deviceMeta}>{device.status === 'Activo' ? 'Conectado' : 'Sin respuesta'}</Text>
          </View>
        </View>
      ))}

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>Recomendación</Text>
        <Text style={styles.warningText}>
          Revisa cualquier dispositivo con riesgo alto, confirma que esté autorizado y valida si el router tiene acceso para invitados y contraseña segura.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 50,
    backgroundColor: '#051923',
    minHeight: '100%',
  },
  headerCard: {
    backgroundColor: '#0d2433',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1d3a4c',
    marginBottom: 18,
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
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 14,
    marginTop: 6,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#0d1d2d',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#20384d',
    marginBottom: 10,
  },
  metricLabel: {
    color: '#93a4b7',
    fontSize: 12,
    marginBottom: 8,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '700',
  },
  scanCard: {
    backgroundColor: '#0d1d2d',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#223d51',
    marginBottom: 18,
  },
  scanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#062a1d',
    fontWeight: '700',
  },
  scanStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#112a38',
    borderRadius: 12,
    padding: 12,
  },
  scanStatusLabel: {
    color: '#94a3b8',
    fontSize: 13,
  },
  scanStatusValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '600',
  },
  riskSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  riskChip: {
    backgroundColor: '#0d1d2d',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#233d53',
  },
  riskText: {
    color: '#dbeafe',
    fontSize: 12,
  },
  deviceListHeader: {
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: '#0d1d2d',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1d3a4c',
    marginBottom: 12,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  riskBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontWeight: '700',
    overflow: 'hidden',
  },
  deviceMeta: {
    color: '#dbeafe',
    fontSize: 12,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  warningCard: {
    marginTop: 10,
    backgroundColor: '#142d3d',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#26475e',
  },
  warningTitle: {
    color: '#fcd34d',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  warningText: {
    color: '#e0f2fe',
    fontSize: 14,
    lineHeight: 20,
  },
});
