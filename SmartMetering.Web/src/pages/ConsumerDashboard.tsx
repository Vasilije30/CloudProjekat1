import { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { getProperties, PropertyResponse } from '../api/properties';
import { getDailyConsumption, getTelemetryTrend, DailyConsumptionPoint, TelemetrySample, TelemetryBroadcastEvent } from '../api/telemetry';
import { API_BASE } from '../api/client';

export default function ConsumerDashboard() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [dailyData, setDailyData] = useState<DailyConsumptionPoint[]>([]);
  const [trendData, setTrendData] = useState<TelemetrySample[]>([]);
  const [liveData, setLiveData] = useState<TelemetryBroadcastEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const connectionRef = useRef<HubConnection | null>(null);
  const activePropertyRef = useRef<string>('');

  // Load properties
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const data = await getProperties();
      setProperties(data);
      if (data.length > 0) {
        setActiveTab(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Load telemetry data when active tab changes
  useEffect(() => {
    if (!activeTab) return;
    loadTelemetryData(activeTab);
  }, [activeTab]);

  const loadTelemetryData = async (propertyId: string) => {
    try {
      const [daily, trend] = await Promise.all([
        getDailyConsumption(propertyId),
        getTelemetryTrend(propertyId),
      ]);
      setDailyData(daily.points || []);
      setTrendData(trend.samples || []);
    } catch (err: any) {
      console.error('Failed to load telemetry data:', err);
    }
  };

  // SignalR connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/telemetry`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    connection.on('ReceiveTelemetry', (event: TelemetryBroadcastEvent) => {
      if (event.propertyId === activePropertyRef.current) {
        setLiveData(event);
      }
    });

    connection.start().then(() => {
      if (activeTab) {
        connection.invoke('JoinProperty', activeTab).catch(console.error);
        activePropertyRef.current = activeTab;
      }
    }).catch(err => {
      console.error('SignalR connection error:', err);
    });

    return () => {
      connection.stop();
    };
  }, []);

  // Switch SignalR group when tab changes
  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection || connection.state !== 'Connected') return;

    const prevProperty = activePropertyRef.current;

    if (prevProperty && prevProperty !== activeTab) {
      connection.invoke('LeaveProperty', prevProperty).catch(console.error);
    }

    if (activeTab) {
      connection.invoke('JoinProperty', activeTab).catch(console.error);
      activePropertyRef.current = activeTab;
    }
  }, [activeTab]);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error-message">{error}</div>;

  if (properties.length === 0) {
    return (
      <div className="empty-state">
        <p>No properties found. Add a property to see your dashboard.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Property Tabs */}
      <div className="tabs">
        {properties.map(prop => (
          <button
            key={prop.id}
            className={`tab ${activeTab === prop.id ? 'active' : ''}`}
            onClick={() => setActiveTab(prop.id)}
          >
            {prop.name}
          </button>
        ))}
      </div>

      {/* Status Cards */}
      <div className="status-cards">
        <div className="status-card">
          <div className="label">Current Tariff</div>
          <div className={`value ${liveData ? 'accent' : ''}`}>
            {liveData ? liveData.tariff : '--'}
          </div>
        </div>
        <div className="status-card">
          <div className="label">Voltage</div>
          <div className={`value ${liveData ? (liveData.voltage < 210 ? 'danger' : 'success') : ''}`}>
            {liveData ? `${liveData.voltage.toFixed(1)} V` : '--'}
          </div>
        </div>
        <div className="status-card">
          <div className="label">Current Load</div>
          <div className="value accent">
            {liveData ? `${liveData.loadKw.toFixed(2)} kW` : '--'}
          </div>
        </div>
        <div className="status-card">
          <div className="label">Total Consumption</div>
          <div className="value">
            {liveData ? `${liveData.totalKwh.toFixed(1)} kWh` : '--'}
          </div>
        </div>
        <div className="status-card">
          <div className="label">Connection Status</div>
          <div className={`value ${liveData ? 'success' : 'danger'}`}>
            {liveData ? 'Connected' : 'Waiting...'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Daily Consumption Bar Chart */}
        <div className="chart-container">
          <h3>Daily Consumption (VT / NT)</h3>
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243353" />
                <XAxis dataKey="date" tickFormatter={formatDate} stroke="#8899b3" fontSize={12} />
                <YAxis stroke="#8899b3" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#152238', border: '1px solid #243353', borderRadius: 4 }}
                  labelStyle={{ color: '#e8edf5' }}
                />
                <Legend />
                <Bar dataKey="vtKwh" name="VT (kWh)" fill="#4dabf7" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ntKwh" name="NT (kWh)" fill="#51cf66" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No consumption data available</p></div>
          )}
        </div>

        {/* Trend Line Chart */}
        <div className="chart-container">
          <h3>Voltage / Load Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243353" />
                <XAxis dataKey="recordedAtUtc" tickFormatter={formatTime} stroke="#8899b3" fontSize={12} />
                <YAxis yAxisId="voltage" orientation="left" stroke="#fcc419" fontSize={12} />
                <YAxis yAxisId="load" orientation="right" stroke="#ff6b6b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#152238', border: '1px solid #243353', borderRadius: 4 }}
                  labelStyle={{ color: '#e8edf5' }}
                  labelFormatter={formatTime}
                />
                <Legend />
                <Line yAxisId="voltage" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#fcc419" dot={false} strokeWidth={2} />
                <Line yAxisId="load" type="monotone" dataKey="loadKw" name="Load (kW)" stroke="#ff6b6b" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No trend data available</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
