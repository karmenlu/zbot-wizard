import React, { useState } from 'react';
import { TextField, Snackbar, Alert, Box, Card, CardContent, Typography, Button } from '@mui/material';
import axios from 'axios';
import '../App.css';

const ChangeServoId = () => {
  // State management
  const [oldId, setOldId] = useState('');
  const [newId, setNewId] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const SNACKBAR_DURATION = 4000; // Duration for the Snackbar to auto-hide
  const API_ENDPOINT = 'http://localhost:8080/change_servo_id';

  // Input validation
  const isValidId = (id) => /^\d+$/.test(id) && id >= 0 && id <= 255;

  const validateInputs = () => {
    if (!oldId || !newId) {
      setSnackbarMessage('Please fill in both Old ID and New ID.');
      setSnackbarSeverity('warning');
      return false;
    }

    if (!isValidId(oldId) || !isValidId(newId)) {
      setSnackbarMessage('IDs must be numeric and between 0 and 255.');
      setSnackbarSeverity('warning');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateInputs()) {
      setOpenSnackbar(true);
      return;
    }

    try {
      const params = {
        old_id: oldId,
        new_id: newId,
      };

      const response = await axios.post(API_ENDPOINT, null, { params });

      setSnackbarMessage(response.data.message || 'ID successfully changed.');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error changing servo ID:', error.response || error); // Debugging
      setSnackbarMessage('Failed to change servo ID. Please try again.');
      setSnackbarSeverity('error');
    } finally {
      setOpenSnackbar(true);
    }
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="App">
      <div className="container">
        <Card className="card">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Change Servo ID
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Old ID"
                value={oldId}
                onChange={(e) => setOldId(e.target.value)}
                type="number"
                variant="outlined"
                size="small"
                required
              />
              <TextField
                label="New ID"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                type="number"
                variant="outlined"
                size="small"
                required
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!oldId || !newId}
              >
                Submit
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={SNACKBAR_DURATION}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChangeServoId;
