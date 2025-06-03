import React from 'react';

const SavedTasksTable = ({ savedTasks }) => {
  return (
    <table className="min-w-full divide-y divide-gray-900 border border-white">
      <thead className="bg-custom-blue">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-white border border-white">Task Name</th>
          {savedTasks.map((task, index) => (
            <th key={index} className="px-6 py-3 text-left text-sm font-medium text-white border border-white">{task.name}</th>
          ))}
        </tr>
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-white border border-white">Due Date</th>
          {savedTasks.map((task, index) => (
            <td key={index} className="px-6 py-3 text-left text-sm font-medium text-white border border-white">{task.dueDate}</td>
          ))}
        </tr>
        <tr>
          <th className="px-6 py-3 text-left text-sm font-medium text-white border border-white">Resources</th>
          {savedTasks.map((task, index) => (
            <td key={index} className="px-6 py-3 text-left text-sm font-medium text-white border border-white">{task.resources}</td>
          ))}
        </tr>
      </thead>
    </table>
  );
};

export default SavedTasksTable;