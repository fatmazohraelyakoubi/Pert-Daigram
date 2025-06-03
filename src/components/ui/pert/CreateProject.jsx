import React, { useState } from 'react';
import { TextField, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NewProject from './NewProject';


const CreateProject = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]); // Track the list of projects

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setProjectName('');
  };

  const handleSaveProject = () => {
    // Save the project and add it to the list
    setProjects([...projects, projectName]);
    handleCloseDialog();
  };

  return (
    <div className="bg-[#020521] w-screen h-screen flex flex-col">
      {/* Header Section */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100px',
          backgroundColor: '#020521',
        }}
        className="bg-[#020521]"
      >
        {/* Search Section */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <TextField
            id="search-bar"
            label="Search"
            variant="outlined"
            size="small"
            className="bg-white w-80 rounded-lg"
          />
        </Box>
      </Box>

      {/* Add Project Button */}
      <div className="flex justify-end p-5 ">
      <button
  className="flex items-center text-white bg-[#041A4C] hover:bg-[#041A4C] focus:outline-none focus:ring-2 focus:ring-[#041A4C] rounded-lg py-2 px-4 text-sm font-semibold"
  onClick={handleOpenDialog}
>
   <AddIcon className="mr-2" />
  Add Project
 </button>
      </div>
      

      {/* New Project Component with projects prop */}
      <NewProject projects={projects} />

      {/* Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Project</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:bg-[#ffffff]"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                className="px-4 py-2 bg-[#020521] text-white rounded-lg hover:bg-[#020521]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;















