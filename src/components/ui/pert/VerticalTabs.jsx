import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SavedTasksTable from './SavedTasksTable';
import PertChart from './PertChart';
// import SavedTasksTable from './SavedTasksTable';
// import PertChart from './PertChart';



function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography sx={{ color: 'white' }}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function VerticalTabs({ tasks, savedTasks }) {
  const [value, setValue] = useState(0);
  

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#020521', display: 'flex', height: 400, borderTop: '1px solid white' }}>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'white' }}
      >
        <Tab label="Pert Diagram" {...a11yProps(0)} sx={{ borderBottom: '1px solid white', borderTop: '1px solid white', color: 'white' }} />
        <Tab label="Gant Diagram" {...a11yProps(1)} sx={{ borderBottom: '1px solid white', borderTop: '1px solid white', color: 'white' }} />
        <Tab label="Task Table" {...a11yProps(2)} sx={{ borderBottom: '1px solid white', borderTop: '1px solid white', color: 'white' }} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <PertChart savedTasks={savedTasks}/>
      
      </TabPanel>
      <TabPanel value={value} index={1}>
        Gant Diagram
      </TabPanel>
      <TabPanel value={value} index={2}>
      <SavedTasksTable savedTasks={savedTasks} tasks={tasks} />
      </TabPanel>
    </Box>
  );
}