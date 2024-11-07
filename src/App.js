import React, { useState, useEffect } from "react";
import agendaData from "./data/agendaData";
import agendaItemsData from "./data/agendaItemsData";
import {
  Clock,
  ListOrdered,
  CheckSquare,
  X,
  Check,
  MoveVertical,
  Loader2,
} from "lucide-react";
import "./App.css";

const StatCard = ({ icon: Icon, title, value, status }) => {
  const statusClass =
    status.value >= status.threshold ? "status-green" : "status-red";
  const iconClass =
    status.value >= status.threshold ? "icon-green" : "icon-red";

  return (
    <div className={`stat-card ${statusClass}`}>
      <div className="stat-content">
        <div>
          <p className="stat-text">{title}</p>
          <p className="stat-value">
            {value}
            {status.suffix && (
              <span className="stat-suffix">{status.suffix}</span>
            )}
          </p>
        </div>
        <Icon className={iconClass} />
      </div>
    </div>
  );
};

const App = () => {
  const [agenda, setAgenda] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showJSON, setShowJSON] = useState(false);

  useEffect(() => {
    // Load mock data
    setAgenda(agendaData);
    setItems(agendaItemsData);
    setLoading(false);
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.currentTarget.style.opacity = "0.5";
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, index) => {
    e.preventDefault();

    if (draggedItem === null) return;

    setLoading(true);
    const newItems = [...items];
    const [draggedItemContent] = newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, draggedItemContent);

    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      order: (idx + 1).toString(),
    }));

    setTimeout(() => {
      setItems(updatedItems);
      setLoading(false);
    }, 800);
  };

  const calculateTimePercentage = (time, start, end) => {
    const parseTime = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };
    const totalDuration = parseTime(end) - parseTime(start);
    const elapsedTime = parseTime(time) - parseTime(start);
    return (elapsedTime / totalDuration) * 100;
  };

  const handlePostponeChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], postpone: value };
    setItems(updatedItems);
  };

  return (
    <div className="agenda-container">
      <h1 className="agenda-title">Agenda Management Workspace</h1>

      {agenda && (
        <div className="agenda-header">
          <h2 className="agenda-header-title">{agenda.name}</h2>
          <p className="agenda-header-info">
            <strong>Start Time:</strong> {agenda.startTime} |{" "}
            <strong>End Time:</strong> {agenda.endTime}
          </p>
          <p className="agenda-header-info">
            <strong>Meeting Environment:</strong> {agenda.meetingEnvironment}
          </p>

          <div className="chronology-bar">
            <div
              className="chronology-segment"
              style={{
                width: "100%",
                position: "relative",
              }}
            >
              {agenda.lunch && (
                <div
                  className="lunch-highlight"
                  style={{
                    left: `${calculateTimePercentage(
                      agenda.lunchStartTime,
                      agenda.startTime,
                      agenda.endTime
                    )}%`,
                    width: `${
                      calculateTimePercentage(
                        agenda.lunchEndTime,
                        agenda.startTime,
                        agenda.endTime
                      ) -
                      calculateTimePercentage(
                        agenda.lunchStartTime,
                        agenda.startTime,
                        agenda.endTime
                      )
                    }%`,
                  }}
                >
                  <span className="lunch-label">Lunch</span>
                </div>
              )}
            </div>
            {agenda.lunch && (
              <div className="lunch-chronology-labels">
                <span
                  style={{
                    position: "absolute",
                    left: `calc(${calculateTimePercentage(
                      agenda.lunchStartTime,
                      agenda.startTime,
                      agenda.endTime
                    )}% + 10px)`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {agenda.lunchStartTime}
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: `calc(${calculateTimePercentage(
                      agenda.lunchEndTime,
                      agenda.startTime,
                      agenda.endTime
                    )}% - 10px)`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {agenda.lunchEndTime}
                </span>
              </div>
            )}
            <div className="chronology-labels">
              <span>{agenda.startTime}</span>
              <span>{agenda.endTime}</span>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon={ListOrdered}
          title="Order"
          value={items.filter((item) => item.order).length}
          status={{
            value: items.filter((item) => item.order).length,
            threshold: items.length,
            suffix: `/ ${items.length}`,
          }}
        />
        <StatCard
          icon={CheckSquare}
          title="Schedule"
          value={items.filter((item) => item.schedule).length}
          status={{
            value: items.filter((item) => item.schedule).length,
            threshold: Math.ceil(items.length * 0.8),
            suffix: `/ ${items.length}`,
          }}
        />
        <StatCard
          icon={Clock}
          title="Timeline"
          value="On Track"
          status={{
            value: 1,
            threshold: 1,
          }}
        />
      </div>

      <div className="table-container">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <Loader2 className="loading-spinner" />
              <p className="stat-text">Updating order...</p>
            </div>
          </div>
        )}

        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Move</th>
              <th className="table-header-cell">Agenda Item</th>
              <th className="table-header-cell">Start Time</th>
              <th className="table-header-cell">End Time</th>
              <th className="table-header-cell">Duration</th>
              <th className="table-header-cell">Note Type</th>
              <th className="table-header-cell">Order</th>
              <th className="table-header-cell">Schedule</th>
              <th className="table-header-cell">Postpone</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className="table-row"
              >
                <td className="table-cell">
                  <div className="drag-handle">
                    <MoveVertical />
                  </div>
                </td>
                <td className="table-cell">{item.agendaItem}</td>
                <td className="table-cell">{item.startTime}</td>
                <td className="table-cell">{item.endTime}</td>
                <td className="table-cell">{item.duration}</td>
                <td className="table-cell">
                  <span className="note-type-badge">{item.noteType}</span>
                </td>
                <td className="table-cell">{item.order}</td>
                <td className="table-cell">
                  {item.schedule ? (
                    <Check className="icon-green" />
                  ) : (
                    <X className="icon-red" />
                  )}
                </td>
                <td className="table-cell">
                  <select
                    className="select-input"
                    value={item.postpone}
                    onChange={(e) =>
                      handlePostponeChange(index, e.target.value)
                    }
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="button-container">
        <button className="action-button sort-button">Sort Items</button>
        <button className="action-button submit-button">Submit</button>
      </div>

      {/* Toggleable JSON Viewer */}
      <div className="json-toggle-container">
        <button
          className="toggle-json-button"
          onClick={() => setShowJSON(!showJSON)}
        >
          {showJSON ? "Hide JSON" : "Show JSON"}
        </button>
        {showJSON && (
          <pre className="json-display">{JSON.stringify(items, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default App;
