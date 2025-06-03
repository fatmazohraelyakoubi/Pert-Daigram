import React, { useState, useEffect } from 'react';
import Draggable from 'react-draggable';

const PertChart = ({ savedTasks, onTaskUpdate }) => {
  const [positions, setPositions] = useState(() => {
    const initialPositions = {
      start: { x: 50, y: 200 }, // Fixed left position
      end: { x: 550, y: 200 }, // Fixed right position
    };

    // Add initial positions for saved tasks
    savedTasks.forEach((task, index) => {
      initialPositions[task.name] = { x: 200, y: 50 + index * 100 };
    });

    return initialPositions;
  });

  const [taskTimes, setTaskTimes] = useState({});
  const [criticalPathTasks, setCriticalPathTasks] = useState([]);
  const [projectTime, setProjectTime] = useState(0);

 useEffect(() => {
  const calculateTaskTimes = () => {
    const times = {};
    const criticalPath = [];

    // حساب الأوقات المبكرة
    savedTasks.forEach((task) => {
      if (task.name && task.dueDate) {
        times[task.name] = { start: 0, end: parseFloat(task.dueDate) }; // البداية الافتراضية
      }
    });

    // حساب الأوقات بناءً على الموارد
    savedTasks.forEach((task) => {
      if (task.name && task.resources) {
        const resourceTask = savedTasks.find((t) => t.name === task.resources);
        if (resourceTask) {
          const resourceEndTime = times[resourceTask.name].end;
          times[task.name].start = resourceEndTime;
          times[task.name].end = resourceEndTime + parseFloat(task.dueDate);
        }
      }
    });

    // حساب الأوقات المتأخرة و الـ lateStart
    savedTasks
      .slice()
      .reverse()
      .forEach((task) => {
        if (task.name) {
          const dependentTasks = savedTasks.filter((t) => t.resources === task.name);
          
          if (dependentTasks.length > 0) {
            const minLateStart = Math.min(
              ...dependentTasks.map((t) => times[t.name]?.start || Infinity)
            );
            times[task.name].lateFinish = minLateStart;
            times[task.name].lateStart = minLateStart - parseFloat(task.dueDate);
          } else {
            const projectEnd = Math.max(
              ...Object.values(times).map((t) => t.end || 0)
            );
            times[task.name].lateFinish = projectEnd;
            times[task.name].lateStart = projectEnd - parseFloat(task.dueDate);
          }

          // حساب Rotar
          times[task.name].rotar = times[task.name].lateStart - times[task.name].start;

          // التحقق من المسار الحرج
          if (times[task.name].start === times[task.name].lateStart) {
            criticalPath.push(task);
          }
        }
      });

    // تحديد المسار الحرج ووقت المشروع
    setTaskTimes(times);
    setCriticalPathTasks(criticalPath);

    setProjectTime(times[savedTasks[savedTasks.length - 1]?.name]?.lateFinish || 0);
  };

  calculateTaskTimes();
}, [savedTasks]);


  const handleDrag = (e, data, taskId) => {
    setPositions((prevPositions) => ({
      ...prevPositions,
      [taskId]: { x: data.x, y: data.y },
    }));
  };

  const renderLines = () => {
    const terminalTasks = savedTasks.filter(
      (task) => !savedTasks.some((t) => t.resources === task.name)
    );

    return savedTasks.flatMap((task) => {
      const taskPosition = positions[task.name];
      const startPosition = positions['start'];
      const endPosition = positions['end'];

      if (!taskPosition || !startPosition || !endPosition) return null;

      const lines = [];
      const isCritical = criticalPathTasks.some(
        (criticalTask) => criticalTask.name === task.name
      );

      if (task.resources === '') {
        lines.push(
          <line
            key={`line-start-${task.name}`}
            x1={startPosition.x + 50}
            y1={startPosition.y + 50}
            x2={taskPosition.x + 50}
            y2={taskPosition.y + 50}
            stroke={isCritical ? 'red' : 'white'}
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        );
      } else {
        const resourceTask = savedTasks.find((t) => t.name === task.resources);
        const resourceTaskPosition = positions[resourceTask?.name];
        if (resourceTaskPosition) {
          lines.push(
            <line
              key={`line-${task.name}-resource`}
              x1={taskPosition.x + 50}
              y1={taskPosition.y + 50}
              x2={resourceTaskPosition.x + 50}
              y2={resourceTaskPosition.y + 50}
              stroke={isCritical ? 'red' : 'white'}
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          );
        }
      }

      if (terminalTasks.some((t) => t.name === task.name)) {
        lines.push(
          <line
            key={`line-${task.name}-end`}
            x1={taskPosition.x + 50}
            y1={taskPosition.y + 50}
            x2={endPosition.x + 50}
            y2={endPosition.y + 50}
            stroke={isCritical ? 'red' : 'white'}
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
        );
      }

      return lines;
    });
  };

  return (
    <div className="relative" style={{ width: '700px', height: '500px' }}>
      <svg
        className="absolute top-0 left-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <polygon points="0,0 10,5 0,10" fill="red" />
          </marker>
        </defs>
        {renderLines()}
      </svg>

      {/* Start Node */}
      <Draggable
        position={positions.start}
        onDrag={(e, data) => handleDrag(e, data, 'start')}
      >
        <div
          className="w-28 h-28 bg-white rounded-full text-center flex items-center justify-center"
          style={{ position: 'absolute' }}
        >
          <div className="absolute h-0.5 w-full bg-black top-1/2 left-0 transform -translate-y-0.5 text-black">
            <h3 className="text-black ml-8 text-[24px]">0</h3>
          </div>
          <div className="absolute h-[60px] w-1 bg-black top-1/2 left-1/2 transform -translate-x-0.5" />
          <h3 className="text-black mr-7 mt-8 text-[24px]">0</h3>
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-xl font-bold">
            Start
          </div>
        </div>
      </Draggable>
      {/* Task Nodes */}
      {savedTasks.map((task) => (
        <Draggable
          key={task.name}
          position={positions[task.name]}
          onDrag={(e, data) => handleDrag(e, data, task.name)}
        >
          <div
            className="w-28 h-28 bg-white rounded-full text-center flex items-center justify-center"
            style={{ position: 'absolute' }}
          >
               

               <h3 className="text-black mr-5 mt-5 text-[24px]">
              {taskTimes[task.name]?.start || 0}
              </h3>
              <div className="absolute top-3/4 h-0.5 w-full bg-black" />
              <h3 className="text-red-600 ml-1 mt-5 text-[24px]">
               {taskTimes[task.name]?.end || 0}
               </h3>
               <div className="absolute h-0.5 w-full bg-black top-1/2 left-0 transform -translate-y-0.5" />
               <div className="absolute h-[60px] w-1 bg-black top-1/2 left-1/2 transform -translate-x-0.5" />
               <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-xl font-bold">
                {task.name}
                </div>

            {/* <div className="absolute top-[-20px] flex justify-between w-full px-2">
              <span className="text-red-600 text-sm font-medium">
                {taskTimes[task.name]?.start || 0}
              </span>
              <span className="text-red-600 text-sm font-medium">
                {taskTimes[task.name]?.end || 0}
              </span>
            </div> */}
            {/* <div className="text-black text-lg font-bold mt-4">{task.name}</div> */}

            <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 text-black text-sm font-medium">
      <h3 className="text-red-600 mr-9 mb-3 text-[24px]">
      {taskTimes[task.name]?.lateStart || 0}
      </h3>
      </div>
      <div  className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 text-black text-sm font-medium">
      <h3 className="text-red-600  mb-[13px] ml-7  text-[24px]">
      {taskTimes[task.name]?.lateFinish || 0}
      </h3>
      </div>
            {/* <div className="absolute bottom-[-10px] flex justify-between w-full px-2">
            
              <span className="text-red-600 text-sm font-medium">
                {taskTimes[task.name]?.lateStart || 0}
              </span>
              <span className="text-red-600 text-sm font-medium">
                {taskTimes[task.name]?.lateFinish || 0}
              </span>
            </div> */}
          </div>
        </Draggable>
      ))}
      {/* End Node */}
      <Draggable
        position={positions.end}
        onDrag={(e, data) => handleDrag(e, data, 'end')}
      >
        <div
          className="w-28 h-28 bg-white rounded-full text-center flex items-center justify-center"
          style={{ position: 'absolute' }}
        >
          <h3 className="text-red-700 mr-5 mt-8 text-[22px]">{projectTime}</h3>
          <div className="absolute h-0.5 w-full bg-black top-1/2 left-0 transform -translate-y-0.5" />
          <h3 className="text-red-700 mr-[-2px] mt-7 text-[22px]">{projectTime}</h3>
          <div className="absolute h-[60px] w-1 bg-black top-1/2 left-1/2 transform -translate-x-0.5" />
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black text-xl font-bold">
            End
          </div>
        </div>
      </Draggable>

      {/* Display Critical Path */}
      <div>
        <h2>
          <ul className="flex items-center space-x-2">
            <span className="text-white">Critical Path:</span>
            {criticalPathTasks.map((task, index) => (
              <li key={task.name} className="flex items-center">
                <span className="text-lg text-red-700"> {task.name}</span>
                {index < criticalPathTasks.length - 1 && (
                  <span className="text-lg mx-1 text-red-700">→</span>
                )}
              </li>
            ))}
          </ul>
        </h2>
        <h2>
          Project Time: <span className="text-lg mx-1 text-red-700">{projectTime}</span>
        </h2>
      </div>
    </div>
  );
};

export default PertChart;