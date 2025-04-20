import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import axios from 'axios';

// Function parameter definitions based on SQL stored procedures
const functionParams = {
  'Add Airplane': [
    { name: 'airlineID', type: 'text', required: true },
    { name: 'tail_num', type: 'text', required: true },
    { name: 'seat_capacity', type: 'number', required: true },
    { name: 'speed', type: 'number', required: true },
    { name: 'locationID', type: 'text', required: true },
    { name: 'plane_type', type: 'select', options: ['Boeing', 'Airbus'], required: true },
    { name: 'maintenanced', type: 'boolean', required: false },
    { name: 'model', type: 'text', required: false },
    { name: 'neo', type: 'boolean', required: false }
  ],
  'Add Airport': [
    { name: 'airportID', type: 'text', required: true },
    { name: 'airport_name', type: 'text', required: true },
    { name: 'city', type: 'text', required: true },
    { name: 'state', type: 'text', required: true },
    { name: 'country', type: 'text', required: true },
    { name: 'locationID', type: 'text', required: true }
  ],
  'Add Person': [
    { name: 'personID', type: 'text', required: true },
    { name: 'first_name', type: 'text', required: true },
    { name: 'last_name', type: 'text', required: false },
    { name: 'locationID', type: 'text', required: true },
    { name: 'taxID', type: 'text', required: false },
    { name: 'experience', type: 'number', required: false },
    { name: 'miles', type: 'number', required: false },
    { name: 'funds', type: 'number', required: false }
  ],
  'Grant or Revoke Pilot License': [
    { name: 'personID', type: 'text', required: true },
    { name: 'license', type: 'text', required: true }
  ],
  'Offer Flight': [
    { name: 'flightID', type: 'text', required: true },
    { name: 'routeID', type: 'text', required: true },
    { name: 'support_airline', type: 'text', required: false },
    { name: 'support_tail', type: 'text', required: false },
    { name: 'progress', type: 'number', required: true },
    { name: 'next_time', type: 'time', required: true },
    { name: 'cost', type: 'number', required: true }
  ],
  'Flight Landing': [
    { name: 'flightID', type: 'text', required: true }
  ],
  'Flight Takeoff': [
    { name: 'flightID', type: 'text', required: true }
  ],
  'Passengers Board': [
    { name: 'flightID', type: 'text', required: true }
  ],
  'Passengers Disembark': [
    { name: 'flightID', type: 'text', required: true }
  ],
  'Assign Pilot': [
    { name: 'flightID', type: 'text', required: true },
    { name: 'personID', type: 'text', required: true }
  ],
  'Recycle Crew': [
    { name: 'flightID', type: 'text', required: true }
  ],
  'Retire Flight': [
    { name: 'flightID', type: 'text', required: true }
  ],
  'Simulation Cycle': []
};

function FunctionForm({ category, functionName }) {
  const [formData, setFormData] = useState({});
  const [viewData, setViewData] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormData({});
    setError(null);
    setSuccess(false);

    const fetchViewData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/view/${functionName}`);
        setViewData(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching view data');
      }
    };

    if (category === 'views' && functionName) {
      fetchViewData();
    }
  }, [category, functionName]);

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (category === 'functions') {
      try {
        // Convert function name to procedure name (lowercase, underscores)
        const procName = functionName.toLowerCase().replace(/ /g, '_');
        
        // Prepare parameters in the correct order as defined in functionParams
        const params = {};
        functionParams[functionName].forEach(param => {
          const value = formData[param.name];
          if (param.required && value === undefined) {
            throw new Error(`${param.name} is required`);
          }
          // Add 'ip_' prefix to match backend procedure parameters
          if (value !== undefined) {
            params[`ip_${param.name}`] = value;
          }
        });

        await axios.post(`http://localhost:5000/api/proc/${procName}`, params);
        setSuccess(true);
        setFormData({});
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      }
    }
  };

  if (category === 'views') {
    if (error) {
      return <Typography color="error">{error}</Typography>;
    }
    
    if (!viewData.length) {
      return <Typography>No data available</Typography>;
    }

    // Format column headers based on view name
    const formatColumnHeader = (key) => {
      const headerMap = {
        'flights_in_the_air': {
          'departing_from': 'Departing From',
          'arriving_at': 'Arriving At',
          'num_flights': 'Number of Flights',
          'flight_list': 'Flight List',
          'earliest_arrival': 'Earliest Arrival',
          'latest_arrival': 'Latest Arrival',
          'airplane_list': 'Airplane List'
        },
        'flights_on_the_ground': {
          'departing_from': 'Airport',
          'num_flights': 'Number of Flights',
          'flight_list': 'Flight List',
          'earliest_arrival': 'Earliest Arrival',
          'latest_arrival': 'Latest Arrival',
          'airplane_list': 'Airplane List'
        },
        'people_in_the_air': {
          'departing_from': 'Departing From',
          'arriving_at': 'Arriving At',
          'num_airplanes': 'Number of Airplanes',
          'airplane_list': 'Airplane List',
          'flight_list': 'Flight List',
          'earliest_arrival': 'Earliest Arrival',
          'latest_arrival': 'Latest Arrival',
          'num_pilots': 'Number of Pilots',
          'num_passengers': 'Number of Passengers',
          'joint_pilots_passengers': 'Total People',
          'person_list': 'Person List'
        },
        'people_on_the_ground': {
          'departing_from': 'Airport ID',
          'airport': 'Location ID',
          'airport_name': 'Airport Name',
          'city': 'City',
          'state': 'State',
          'country': 'Country',
          'num_pilots': 'Number of Pilots',
          'num_passengers': 'Number of Passengers',
          'joint_pilots_passengers': 'Total People',
          'person_list': 'Person List'
        },
        'route_summary': {
          'route': 'Route ID',
          'num_legs': 'Number of Legs',
          'leg_sequence': 'Leg Sequence',
          'route_length': 'Route Length',
          'num_flights': 'Number of Flights',
          'flight_list': 'Flight List',
          'airport_sequence': 'Airport Sequence'
        },
        'alternative_airports': {
          'city': 'City',
          'state': 'State',
          'country': 'Country',
          'num_airports': 'Number of Airports',
          'airport_code_list': 'Airport Codes',
          'airport_name_list': 'Airport Names'
        }
      };

      // Special handling for alternative_airports view
      if (functionName === 'alternative_airports') {
        return headerMap[functionName][key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      }

      // For other views, exclude available flights
      if (key === 'available_flights') {
        return null;
      }

      return headerMap[functionName]?.[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Format cell value based on data type
    const formatCellValue = (value, key) => {
      if (value === null || value === undefined) return '';
      
      // Handle Decimal types
      if (typeof value === 'object' && value.toString) {
        return value.toString();
      }
      
      // Format time values
      if (key.includes('time') || key.includes('arrival')) {
        return value.toString();
      }
      
      // Format lists (comma-separated values)
      if (key.includes('list')) {
        return value.split(',').join(', ');
      }
      
      return value.toString();
    };

    return (
      <Box sx={{ overflowX: 'auto', mt: 2 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {Object.keys(viewData[0])
                .filter(key => key !== 'available_flights')
                .map(key => (
                  <th key={key} style={{ 
                    border: '1px solid #ddd', 
                    padding: '12px 8px', 
                    textAlign: 'left',
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold'
                  }}>
                    {formatColumnHeader(key)}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {viewData.map((row, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f9f9f9' }}>
                {Object.entries(row)
                  .filter(([key]) => key !== 'available_flights')
                  .map(([key, value], j) => (
                    <td key={j} style={{ 
                      border: '1px solid #ddd', 
                      padding: '8px',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {formatCellValue(value, key)}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  }

  const params = functionParams[functionName] || [];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {params.map(param => {
        if (param.type === 'boolean') {
          return (
            <FormControlLabel
              key={param.name}
              control={
                <Checkbox
                  name={param.name}
                  checked={formData[param.name] || false}
                  onChange={handleInputChange}
                />
              }
              label={param.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            />
          );
        }
        
        if (param.type === 'select') {
          return (
            <TextField
              key={param.name}
              select
              label={param.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              name={param.name}
              value={formData[param.name] || ''}
              onChange={handleInputChange}
              required={param.required}
              fullWidth
            >
              {param.options.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        return (
          <TextField
            key={param.name}
            label={param.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            name={param.name}
            type={param.type}
            value={formData[param.name] || ''}
            onChange={handleInputChange}
            required={param.required}
            fullWidth
          />
        );
      })}
      
      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}
      
      {success && (
        <Typography color="success.main">
          Operation completed successfully!
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          type="button" 
          onClick={() => setFormData({})}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          disabled={!params.length}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}

export default FunctionForm; 