import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField, Alert } from '@mui/material';
import axios from 'axios';

const serviceBaseUrl = 'http://localhost:8080';
const botIp = '192.168.42.1';

const ServoDashboard = ({ servoIds, defaultRange = { min: 0, max: 180 } }) => {
  const [selectedServoId, setSelectedServoId] = useState(null);
  const [servoStates, setServoStates] = useState(
    servoIds.reduce((state, id) => {
      state[id] = {
        position: 0,
        calibrating: false,
        sliderValue: 0,
        range: defaultRange,
        temperature: null,
        current: null,
        voltage: null,
        speed: null,
      };
      return state;
    }, {})
  );
  const [error, setError] = useState(null);

  const fetchServoInfo = async (servoId) => {
    try {
      const response = await axios.get(`${serviceBaseUrl}/get_servo_info?servo_id=${servoId}&ip=${botIp}`);
      if (response.status === 200) {
        const { info } = response.data;
        setServoStates((prevState) => ({
          ...prevState,
          [servoId]: { 
            ...prevState[servoId], 
            position: info.current_position,
            temperature: info.temperature, 
            current: info.current,
            voltage: info.voltage,
            speed: info.speed,
          },
        }));
      }
    } catch (error) {
      console.error(`Error fetching servo info for servo ${servoId}:`, error);
      setError(`Failed to fetch servo info for servo ${servoId}.`);
    }
  };

  useEffect(() => {
    if (selectedServoId) {
      const intervalId = setInterval(() => {
        fetchServoInfo(selectedServoId);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [selectedServoId]);
  
  const handleSelectServo = (servoId) => {
    setSelectedServoId(servoId === selectedServoId ? null : servoId);
    setError(null);
  };

  const handleSetPosition = async () => {
    if (!selectedServoId) {
      setError('Please select a servo ID first!');
      return;
    }

    const { sliderValue } = servoStates[selectedServoId];
    try {
      const response = await axios.post(
        `${serviceBaseUrl}/set_servo_position?ip=${botIp}?id=${selectedServoId}`,
        { position: sliderValue }
      );
      if (response.status === 200) {
        setServoStates((prevState) => ({
          ...prevState,
          [selectedServoId]: { ...prevState[selectedServoId], position: sliderValue },
        }));
      }
    } catch (error) {
      console.error(`Error setting position for servo ${selectedServoId}:`, error);
      setError(`Failed to set position for servo ${selectedServoId}.`);
    }
  };

  const handleStartCalibration = async () => {
    if (!selectedServoId) {
      setError('Please select a servo ID first!');
      return;
    }

    try {
      const response = await axios.post(
        `${serviceBaseUrl}/start_calibration?ip=${botIp}&servo_id=${selectedServoId}`
      );
      if (response.status === 200) {
        setServoStates((prevState) => ({
          ...prevState,
          [selectedServoId]: { ...prevState[selectedServoId], calibrating: true },
        }));
      }
    } catch (error) {
      console.error(`Error starting calibration for servo ${selectedServoId}:`, error);
      setError(`Failed to start calibration for servo ${selectedServoId}.`);
    }
  };

  const handleCancelCalibration = async () => {
    if (!selectedServoId) {
      setError('Please select a servo ID first!');
      return;
    }

    try {
      const response = await axios.post(
        `${serviceBaseUrl}/cancel_calibration?ip=${botIp}&servo_id=${selectedServoId}`
      );
      if (response.status === 200) {
        setServoStates((prevState) => ({
          ...prevState,
          [selectedServoId]: { ...prevState[selectedServoId], calibrating: false },
        }));
      }
    } catch (error) {
      console.error(`Error canceling calibration for servo ${selectedServoId}:`, error);
      setError(`Failed to cancel calibration for servo ${selectedServoId}.`);
    }
  };

  const handleSliderChange = (value) => {
    setServoStates((prevState) => ({
      ...prevState,
      [selectedServoId]: { ...prevState[selectedServoId], sliderValue: value },
    }));
  };

  const handleSliderBlur = () => {
    if (servoStates[selectedServoId].sliderValue < defaultRange.min) {
      setError(`Value is below the minimum of ${defaultRange.min}`);
    } else if (servoStates[selectedServoId].sliderValue > defaultRange.max) {
      setError(`Value exceeds the maximum of ${defaultRange.max}`);
    } else {
      setError(null);
    }
  };

  const { position, calibrating, sliderValue, range } = selectedServoId
    ? servoStates[selectedServoId]
    : { position: 0, calibrating: false, sliderValue: 0, range: defaultRange };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Manage Servo
      </Typography>

      <Box sx={{ marginBottom: 2 }}>
        {servoIds.map((servoId) => (
          <Button
            key={servoId}
            variant={servoId === selectedServoId ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => handleSelectServo(servoId)}
            sx={{ marginRight: 1 }}
          >
            {servoId}
          </Button>
        ))}
      </Box>

      {!selectedServoId ? (
        <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
          <Typography variant="body1">
            Please select a servo to control. When a servo is selected, you will be able to adjust its position and calibration.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3} sx={{ padding: 2, marginTop: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body1">Servo: {selectedServoId}</Typography>
            <Typography variant="body1">Position: {position}°</Typography>
            <Typography variant="body1">Temperature: {servoStates[selectedServoId]?.temperature}°C</Typography>
            <Typography variant="body1">Current: {servoStates[selectedServoId]?.current}A</Typography>
            <Typography variant="body1">Voltage: {servoStates[selectedServoId]?.voltage}V</Typography>
            <Typography variant="body1">Speed: {servoStates[selectedServoId]?.speed}°/s</Typography>
            <TextField
              type="number"
              value={sliderValue}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              onBlur={handleSliderBlur}
              variant="outlined"
              label="Set Position (0-180)"
              sx={{ width: '100%', marginTop: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSetPosition}
              sx={{ marginTop: 1 }}
            >
              Set Position
            </Button>
          </Box>

          <Box sx={{ marginTop: 2 }}>
            <Typography variant="body1">Calibration: {calibrating ? 'In Progress' : 'Idle'}</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleStartCalibration}
              disabled={calibrating}
              sx={{ marginRight: 1 }}
            >
              {calibrating ? 'Calibrating...' : 'Start Calibration'}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelCalibration}
              disabled={!calibrating}
            >
              Cancel Calibration
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ServoDashboard;
