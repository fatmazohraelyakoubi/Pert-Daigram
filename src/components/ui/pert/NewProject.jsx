import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';

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

export default function NewProject({ projects }) {
  const [value, setValue] = React.useState(0);

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

<Tab label="Projects" {...a11yProps(0)} sx={{ borderBottom: '1px solid white', borderTop: '1px solid white', color: 'white' }} />
        {/* Loop through the projects to create individual tabs */}
        {projects.length === 0 ? (
          <Tab />
        ) : (
          projects.map((project, index) => (
            <Tab key={index} label={project} {...a11yProps(index)} sx={{ borderBottom: '1px solid white', color: 'white' }} />
          ))
        )}
      </Tabs>

      {/* Loop through the projects to create a corresponding TabPanel for each */}
              {projects.length === 0 ? (
                <TabPanel value={value} index={0}>
                 <Typography sx={{ color: 'white' }}>
                   No projects created yet.
                 </Typography>

        </TabPanel>
      ) : (
        projects.map((project, index) => (
          <TabPanel value={value} index={index} key={index}>
          
          </TabPanel>
        ))
      )}
    </Box>
  );
}
