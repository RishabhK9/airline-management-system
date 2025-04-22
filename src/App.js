import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemButton, ListItemText, Divider, Tabs, Tab } from '@mui/material';
import FunctionForm from './components/FunctionForm';
import axios from 'axios';

function App() {
  const [category, setCategory] = useState('functions');
  const [selectedItem, setSelectedItem] = useState('Add Airplane');
  const [tables, setTables] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [functions] = useState([
    'Add Airplane',
    'Add Airport',
    'Add Person',
    'Grant or Revoke Pilot License',
    'Offer Flight',
    'Flight Landing',
    'Flight Takeoff',
    'Passengers Board',
    'Passengers Disembark',
    'Assign Pilot',
    'Recycle Crew',
    'Retire Flight',
    'Simulation Cycle'
  ]);
  const [views] = useState([
    'flights_in_the_air',
    'flights_on_the_ground',
    'people_in_the_air',
    'people_on_the_ground',
    'route_summary',
    'alternative_airports'
  ]);
  const [developers] = useState([
    'Rishabh Kanodia',
    'Nix Pham',
    'Caroline Betz',
    'Nevin Jiang'
  ]);

  // Function to get the appropriate list based on category
  const getList = () => {
    switch (category) {
      case 'functions':
        return functions;
      case 'views':
        return views;
      case 'tables':
        return tables;
      default:
        return [];
    }
  };

  // Fetch table list when Tables category is selected
  useEffect(() => {
    if (category === 'tables') {
      axios.get('http://127.0.0.1:5000/api/view/tables')
        .then(response => {
          const tableList = response.data.map(row => 
            row[`Tables_in_${process.env.REACT_APP_DB_NAME || 'flight_tracking'}`]
          );
          setTables(tableList);
          // Only set selected item if we don't have one for this category
          if (!selectedItem) {
            setSelectedItem(tableList[0]);
          }
        })
        .catch(error => console.error('Error fetching tables:', error));
    }
  }, [category, selectedItem]);

  // Fetch table data when a table is selected
  useEffect(() => {
    if (category === 'tables' && selectedItem) {
      axios.get(`http://127.0.0.1:5000/api/view/${selectedItem}`)
        .then(response => {
          setTableData(response.data);
        })
        .catch(error => console.error('Error fetching table data:', error));
    }
  }, [category, selectedItem]);

  const handleTabChange = (newValue) => {
    setCategory(newValue);
    // Only select first item if we're switching to a new category
    if (newValue !== category) {
      if (newValue === 'functions') {
        setSelectedItem('Add Airplane');
      } else if (newValue === 'views') {
        setSelectedItem('flights_in_the_air');
      } else if (newValue === 'tables') {
        // Tables will be handled by the useEffect
        setSelectedItem(null);
      } else {
        setSelectedItem(null);
      }
    }
    // Reset table data when changing away from tables
    if (newValue !== 'tables') {
      setTableData([]);
    }
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 2,
      bgcolor: '#f0f2f5'
    }}>
      <Box sx={{ 
        width: '66%',
        display: 'flex', 
        flexDirection: 'column',
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            mb: 3,
            color: '#1a237e',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Airline Management System
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          border: '1px solid #333',
          borderRadius: 2,
          bgcolor: 'white',
          p: 2,
          minHeight: '500px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Left Sidebar with Category Tabs */}
          <Box sx={{ display: 'flex' }}>
            <Tabs
              orientation="vertical"
              value={category}
              onChange={(e, newValue) => handleTabChange(newValue)}
              sx={{ 
                borderRight: '1px solid #333',
                minWidth: '120px',
                '& .MuiTab-root': {
                  color: '#546e7a',
                  '&.Mui-selected': {
                    color: '#1a237e',
                    fontWeight: 600
                  }
                }
              }}
            >
              <Tab label="Functions" value="functions" />
              <Tab label="Views" value="views" />
              <Tab label="Tables" value="tables" />
              <Tab label="Credits" value="credits" />
            </Tabs>

            {/* List of items - Only show for functions, views, and tables */}
            {category !== 'credits' && (
              <Paper sx={{ 
                width: '200px', 
                ml: 2,
                display: 'flex', 
                flexDirection: 'column',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    p: 2,
                    color: '#1a237e',
                    fontWeight: 600,
                    bgcolor: '#f5f5f5'
                  }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <Divider sx={{ borderColor: '#333' }} />
                <List sx={{ flex: 1, overflow: 'auto' }}>
                  {getList().map((item) => (
                    <ListItem key={item} disablePadding>
                      <ListItemButton 
                        selected={selectedItem === item}
                        onClick={() => setSelectedItem(item)}
                        sx={{
                          '&.Mui-selected': {
                            bgcolor: '#e8eaf6',
                            '&:hover': {
                              bgcolor: '#e8eaf6',
                            }
                          },
                          '&:hover': {
                            bgcolor: '#f5f5f5',
                          }
                        }}
                      >
                        <ListItemText 
                          primary={item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} 
                          sx={{
                            '& .MuiTypography-root': {
                              color: selectedItem === item ? '#1a237e' : '#333',
                              fontWeight: selectedItem === item ? 600 : 400
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          {/* Main Content */}
          <Paper sx={{ 
            flexGrow: 1, 
            p: 3,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
          }}>
            {selectedItem && category !== 'credits' && category !== 'tables' && (
              <>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{
                    color: '#1a237e',
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  {selectedItem.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Typography>
                <FunctionForm 
                  category={category}
                  functionName={selectedItem}
                />
              </>
            )}
            {category === 'tables' && selectedItem && (
              <>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{
                    color: '#1a237e',
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  {selectedItem.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  {tableData.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {Object.keys(tableData[0]).map(key => (
                            <th key={key} style={{ 
                              border: '1px solid #ddd', 
                              padding: '12px 8px',
                              backgroundColor: '#f5f5f5',
                              color: '#1a237e',
                              textAlign: 'left'
                            }}>
                              {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((value, j) => (
                              <td key={j} style={{ 
                                border: '1px solid #ddd', 
                                padding: '8px',
                                backgroundColor: i % 2 === 0 ? 'white' : '#f8f9fa'
                              }}>
                                {value?.toString() || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <Typography>Loading table data...</Typography>
                  )}
                </Box>
              </>
            )}
            {category === 'credits' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{
                    color: '#1a237e',
                    fontWeight: 600,
                    mb: 4
                  }}
                >
                  Development Team
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#333',
                    fontSize: '1.1rem',
                    lineHeight: 2,
                    mb: 3
                  }}
                >
                  This application was developed by:
                </Typography>
                {developers.map((developer) => (
                  <Typography 
                    key={developer}
                    variant="h6" 
                    sx={{ 
                      color: '#1a237e',
                      fontWeight: 500,
                      my: 1.5
                    }}
                  >
                    {developer}
                  </Typography>
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default App; 