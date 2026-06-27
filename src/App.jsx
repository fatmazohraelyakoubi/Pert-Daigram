import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskPage from "./components/ui/pert/TaskPage";
import VerticalTabs from "./components/ui/pert/VerticalTabs";
import CreateProject from "./components/ui/pert/CreateProject";
function App() {
 
  return (

 <Router>
  <Routes>
    <Route path="/" element={<TaskPage />} />
    <Route path="/V" element={<VerticalTabs />} />
    <Route path="/CreateProject" element={<CreateProject/>} /> 
   </Routes> </Router>
  );
}

export default App;









