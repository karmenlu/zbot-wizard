import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, TextareaAutosize, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import '../App.css';

const API_BASE_URL = 'http://localhost:8080';
const DEVICE_IP = '192.168.42.1';

const endpoints = {
  ping: `${API_BASE_URL}/ping?ip=${DEVICE_IP}`,
  scan: `${API_BASE_URL}/scan_servos?ip=${DEVICE_IP}`,
  positions: `${API_BASE_URL}/get_positions?ip=${DEVICE_IP}`,
  imu: `${API_BASE_URL}/get_imu_data?ip=${DEVICE_IP}`,
};

const SystemChecksCard = () => {
  const [pingResult, setPingResult] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [positionsResult, setPositionsResult] = useState('');
  const [imuResult, setImuResult] = useState('');
  const [loading, setLoading] = useState(true);

  const [pingActive, setPingActive] = useState(true);
  const [scanActive, setScanActive] = useState(true);
  const [positionsActive, setPositionsActive] = useState(true);
  const [imuActive, setImuActive] = useState(true);

  const [pingInterval, setPingInterval] = useState(null);
  const [scanInterval, setScanInterval] = useState(null);
  const [positionsInterval, setPositionsInterval] = useState(null);
  const [imuInterval, setImuInterval] = useState(null);

  const apiRequest = async (url) => {
    try {
      const response = await axios.get(url);
      if (response.data.status === 'success') {
        return response.data;
      } else {
        throw new Error('Invalid response status');
      }
    } catch (error) {
      console.error('Error during request:', error);
      throw new Error(error.message);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      if (pingActive) {
        const pingResponse = await apiRequest(endpoints.ping);
        setPingResult(`${pingResponse.message}\n\n${pingResponse.output}`);
      }

      if (scanActive) {
        const scanResponse = await apiRequest(endpoints.scan);
        setScanResult(`Servos found: ${scanResponse.servo_ids.join(', ')}`);
      }

      if (positionsActive) {
        const positionsResponse = await apiRequest(endpoints.positions);
        const positions = positionsResponse.data
          .map(
            (servo) =>
              `Servo ID: ${servo.servo_id}, Position: ${servo.position}, Speed: ${servo.speed}`
          )
          .join('\n');
        setPositionsResult(positions);
      }

      if (imuActive) {
        const imuResponse = await apiRequest(endpoints.imu);
        setImuResult(
          `Gyroscope: ${JSON.stringify(imuResponse.gyro)}, Accelerometer: ${JSON.stringify(imuResponse.accel)}`
        );
      }
    } catch (error) {
      setPingResult(`Error: ${error.message}`);
      setScanResult(`Error: ${error.message}`);
      setPositionsResult(`Error: ${error.message}`);
      setImuResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startInterval = (intervalType, intervalTime, setter) => {
    const intervalId = setInterval(() => {
      fetchData();
    }, intervalTime);
    setter(intervalId);
  };

  const stopInterval = (intervalId) => {
    clearInterval(intervalId);
  };

  useEffect(() => {
    startInterval(pingInterval, 10000, setPingInterval);
    startInterval(scanInterval, 10000, setScanInterval);
    startInterval(positionsInterval, 10000, setPositionsInterval);
    startInterval(imuInterval, 10000, setImuInterval);

    return () => {
      stopInterval(pingInterval);
      stopInterval(scanInterval);
      stopInterval(positionsInterval);
      stopInterval(imuInterval);
    };
  }, []);

  const toggleActiveState = (type) => {
    switch (type) {
      case 'ping':
        setPingActive(!pingActive);
        if (!pingActive) {
          startInterval(pingInterval, 10000, setPingInterval);
        } else {
          stopInterval(pingInterval);
        }
        break;
      case 'scan':
        setScanActive(!scanActive);
        if (!scanActive) {
          startInterval(scanInterval, 10000, setScanInterval);
        } else {
          stopInterval(scanInterval);
        }
        break;
      case 'positions':
        setPositionsActive(!positionsActive);
        if (!positionsActive) {
          startInterval(positionsInterval, 10000, setPositionsInterval);
        } else {
          stopInterval(positionsInterval);
        }
        break;
      case 'imu':
        setImuActive(!imuActive);
        if (!imuActive) {
          startInterval(imuInterval, 10000, setImuInterval);
        } else {
          stopInterval(imuInterval);
        }
        break;
      default:
        break;
    }
  };

  return (
    <Card className="system-checks-card">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 2 }}>
          <Typography variant="h5" className="header-text" sx={{ flexGrow: 1 }}>
            System Checks
          </Typography>

          <Button variant="contained" onClick={() => toggleActiveState('ping')}>
            {pingActive ? 'Pause Ping' : 'Resume Ping'}
          </Button>
          <Button variant="contained" onClick={() => toggleActiveState('scan')}>
            {scanActive ? 'Pause Scan' : 'Resume Scan'}
          </Button>
          <Button variant="contained" onClick={() => toggleActiveState('positions')}>
            {positionsActive ? 'Pause Positions' : 'Resume Positions'}
          </Button>
          <Button variant="contained" onClick={() => toggleActiveState('imu')}>
            {imuActive ? 'Pause IMU' : 'Resume IMU'}
          </Button>
        </Box>


        <Box className="result-box" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextareaAutosize
            minRows={5}
            placeholder="Ping Result"
            value={pingResult}
            className="result-textarea"
            readOnly
            style={{ width: '100%' }}
          />
          <TextareaAutosize
            minRows={5}
            placeholder="Scan Result"
            value={scanResult}
            className="result-textarea"
            readOnly
            style={{ width: '100%' }}
          />
          <TextareaAutosize
            minRows={5}
            placeholder="Positions Result"
            value={positionsResult}
            className="result-textarea"
            readOnly
            style={{ width: '100%' }}
          />
          <TextareaAutosize
            minRows={5}
            placeholder="IMU Data"
            value={imuResult}
            className="result-textarea"
            readOnly
            style={{ width: '100%' }}
          />

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SystemChecksCard;
