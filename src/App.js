import React, { useState, useEffect } from "react";
import "./styles.css";

const TaskTracker = () => {
  const [tasks, setTasks] = useState(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));
    return (
      storedTasks || {
        todo: [],
        inProgress: [],
        done: [],
      }
    );
  });

  const [editText, setEditText] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const createTask = (name, status) => {
    const newTask = { id: Date.now(), name: name };
    setTasks({ ...tasks, [status]: [...tasks[status], newTask] });
  };

  const handleDragStart = (e, taskId, status) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("status", status);
  };

  const handleDrop = (e, targetStatus) => {
    const taskId = parseInt(e.dataTransfer.getData("taskId"), 10);
    const sourceStatus = e.dataTransfer.getData("status");

    const task = tasks[sourceStatus].find((t) => t.id === taskId);

    if (task) {
      const updatedTasks = { ...tasks };

      updatedTasks[sourceStatus] = tasks[sourceStatus].filter(
        (t) => t.id !== taskId
      );
      updatedTasks[targetStatus] = [...tasks[targetStatus], task];

      setTasks(updatedTasks);
    }
  };

  const deleteTask = (status, taskId) => {
    const updatedTasks = { ...tasks };
    updatedTasks[status] = tasks[status].filter((task) => task.id !== taskId);

    setTasks(updatedTasks);
  };

  const handleEditTask = (status, taskId) => {
    const updatedTasks = { ...tasks };
    const taskIndex = tasks[status].findIndex((task) => task.id === taskId);
    updatedTasks[status][taskIndex].name = editText;

    setTasks(updatedTasks);
    setEditText("");
    setEditTaskId(null);
  };

  return (
    <div className="task-tracker">
      {Object.keys(tasks).map((status) => (
        <div
          key={status}
          className={`column ${status}`}
          onDrop={(e) => handleDrop(e, status)}
          onDragOver={(e) => e.preventDefault()}
        >
          <h2>{status.charAt(0).toUpperCase() + status.slice(1)}</h2>
          {tasks[status].map((task) => (
            <div
              key={task.id}
              className="task"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, task.id, status)}
            >
              {editTaskId === task.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleEditTask(status, task.id)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleEditTask(status, task.id)
                  }
                />
              ) : (
                <>
                  <p>{task.name}</p>
                  <button
                    onClick={() => {
                      setEditText(task.name);
                      setEditTaskId(task.id);
                    }}
                  >
                    Edit
                  </button>
                </>
              )}

              <button onClick={() => deleteTask(status, task.id)}>
                Delete
              </button>
            </div>
          ))}
          <input
            type="text"
            placeholder="Add task..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.target.value.trim() !== "") {
                createTask(e.target.value.trim(), status);
                e.target.value = "";
              }
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskTracker;
