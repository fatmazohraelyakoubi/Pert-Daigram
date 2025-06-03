// import React, { useState } from 'react';
// import { TextField, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import VerticalTabs from './VerticalTabs';


// const TaskPage = () => {
//   const [openDialog, setOpenDialog] = useState(false);
//   const [newTaskName, setNewTaskName] = useState('');
//   const [newDueDate, setNewDueDate] = useState('');
//   const [newResources, setNewResources] = useState('');
//   const [tasks, setTasks] = useState([]);
//   const [savedTasks, setSavedTasks] = useState([]);

//   const handleOpenDialog = () => {
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//   };

//   const handleCreateNewTask = () => {
//     const newTask = { name: newTaskName, dueDate: newDueDate, resources: newResources };
//     setTasks([...tasks, newTask]);
//     setNewTaskName('');
//     setNewDueDate('');
//     setNewResources('');
//   };

//   const handleSaveTasks = () => {
//     setSavedTasks([...savedTasks, ...tasks]);
//     setTasks([]);
//     setOpenDialog(false);
//   };


//   return (
    
//     <div className='bg-[#020521] w-screen h-screen flex flex-col justify-start'>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           width: '100%',
//           padding: '20px',
//         }}
//       >
//         <TextField
//           id="search-bar"
//           label="Search"
//           variant="outlined"
//           size="small"
//           sx={{ backgroundColor: 'white', width: { xs: '90%', sm: '300px', md: '400px' } }}
//         />
//       </Box>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'flex-end',
//           padding: '20px',
//         }}
//       >
//         <Button
//           variant="contained"
//           color="primary"
//           size="small"
//           sx={{ color: 'white', backgroundColor: '#040A4C' }}
//           startIcon={<AddIcon />}
//           onClick={handleOpenDialog}
//         >
//           Add Task
//         </Button>
//       </Box>



      
//       <VerticalTabs tasks={tasks} savedTasks={savedTasks} />
//       <Dialog open={openDialog} onClose={handleCloseDialog}>
//         <DialogTitle style={{ textAlign: 'center' }}>Fill Your Task</DialogTitle>
//         <DialogContent>
//           <TextField
//             value={newTaskName}
//             onChange={(e) => setNewTaskName(e.target.value)}
//             variant="outlined"
//             label="Task Name"
//             fullWidth
//           />
//           <TextField
//             value={newDueDate}
//             onChange={(e) => setNewDueDate(e.target.value)}
//             variant="outlined"
//             label="Due Date"
//             fullWidth
//           />
//           <TextField
//             value={newResources}
//             onChange={(e) => setNewResources(e.target.value)}
//             variant="outlined"
//             label="Resources"
//             fullWidth
//           />
//           <Button
//             variant="contained"
//             color="primary"
//             sx={{ backgroundColor: '#020736', marginTop: '10px' }}
//             onClick={handleCreateNewTask}
//           >
//             Add Task
//           </Button>
          
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Task Name</TableCell>
//                 <TableCell>Due Date</TableCell>
//                 <TableCell>Resources</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {tasks.map((task, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{task.name}</TableCell>
//                   <TableCell>{task.dueDate}</TableCell>
//                   <TableCell>{task.resources}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleSaveTasks} color="primary">
//             Save
//           </Button>
//           <Button onClick={handleCloseDialog} color="primary">
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
      
//     </div>
//   );
// };

// export default TaskPage;


























// TaskPage.jsx
import React, { useState } from 'react';
import {
  TextField,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VerticalTabs from './VerticalTabs';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const TaskPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newDueDate, setNewDueDate] = useState(null);
  const [newResources, setNewResources] = useState('');
  const [tasks, setTasks] = useState([]);
  const [savedTasks, setSavedTasks] = useState([]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleCreateNewTask = () => {
    if (!newTaskName || !newDueDate || !newResources) return;

    const newTask = {
      name: newTaskName,
      dueDate: newDueDate,
      resources: newResources,
    };

    setTasks([...tasks, newTask]);
    setNewTaskName('');
    setNewDueDate(null);
    setNewResources('');
  };

  const handleSaveTasks = () => {
    setSavedTasks([...savedTasks, ...tasks]);
    setTasks([]);
    setOpenDialog(false);
  };

  return (
    <div className="bg-[#020521] w-screen h-screen flex flex-col justify-start">
      {/* Search Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          padding: '20px',
        }}
      >
        <TextField
          id="search-bar"
          label="Search"
          variant="outlined"
          size="small"
          sx={{
            backgroundColor: 'white',
            width: { xs: '90%', sm: '300px', md: '400px' },
          }}
        />
      </Box>

      {/* Add Task Button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '20px',
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ color: 'white', backgroundColor: '#040A4C' }}
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Task
        </Button>
      </Box>

      {/* Tabs View */}
      <VerticalTabs tasks={tasks} savedTasks={savedTasks} />

      {/* Popup Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ textAlign: 'center' }}>Fill Your Task</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            variant="outlined"
            label="Task Name"
            fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Due Date"
              value={newDueDate}
              onChange={(newValue) => setNewDueDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>

          <TextField
            value={newResources}
            onChange={(e) => setNewResources(e.target.value)}
            variant="outlined"
            label="Resources"
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            sx={{ backgroundColor: '#020736' }}
            onClick={handleCreateNewTask}
          >
            Add Task
          </Button>

          {/* Table of Added Tasks */}
          {tasks.length > 0 && (
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Resources</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.name}</TableCell>
                    <TableCell>{task.dueDate?.toLocaleDateString()}</TableCell>
                    <TableCell>{task.resources}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSaveTasks} color="primary">
            Save
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskPage;
