import React, { useState } from 'react';
import { Container, Typography, TextField, Box } from '@mui/material';
import ServoDashboard from './components/ServoDashboard';
import ChangeServoId from './components/ChangeServoId';
import SystemChecksCard from './components/SystemChecksCard';
import './App.css';

const App = () => {
  const [servoIp, setServoIp] = useState('http://192.168.1.100');
  const [servoPort, setServoPort] = useState('8080');
  
  const [botIp, setBotIp] = useState('192.168.42.1');

  const handleServoIpChange = (e) => {
    setServoIp(e.target.value);
  };

  const handleServoPortChange = (e) => {
    setServoPort(e.target.value);
  };

  const handleBotIpChange = (e) => {
    setBotIp(e.target.value);
  };

  const servoIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

  return (
    <Container className="App">
      <Typography variant="h3" gutterBottom>
        Servo Control System
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="flex-start" marginBottom={2}>
        <TextField
          label="Servo IP Address"
          value={servoIp}
          onChange={handleServoIpChange}
          variant="outlined"
          size="small"
          fullWidth
          helperText="Enter the IP address of the servo system"
        />
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-start" marginBottom={2}>
        <TextField
          label="Servo Port"
          value={servoPort}
          onChange={handleServoPortChange}
          variant="outlined"
          size="small"
          fullWidth
          helperText="Enter the port number for the servo system"
        />
      </Box>

      <Box display="flex" flexDirection="column" alignItems="flex-start" marginBottom={2}>
        <TextField
          label="Bot IP Address"
          value={botIp}
          onChange={handleBotIpChange}
          variant="outlined"
          size="small"
          fullWidth
          helperText="Enter the IP address of the bot"
        />
      </Box>

      <div>
        <div className="card">
          <SystemChecksCard
            servoIp={`${servoIp}:${servoPort}`}
            botIp={botIp}
          />
        </div>
        <div className="card">
          <ChangeServoId
            servoIp={`${servoIp}:${servoPort}`}
          />
        </div>
        <ServoDashboard
          servoIds={servoIds}
          servoIp={`${servoIp}:${servoPort}`}
          botIp={botIp}
          className="card"
        />
      </div>
    </Container>
  );
};

export default App;
