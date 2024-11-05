import React, { useState, useEffect } from 'react';
import { Clock, ListOrdered, CheckSquare, X, Check, MoveVertical, Loader2 } from 'lucide-react';
import './App.css';

const StatCard = ({ icon: Icon, title, value, status }) => {
  const statusClass = status.value >= status.threshold ? 'status-green' : 'status-red';
  const iconClass = status.value >= status.threshold ? 'icon-green' : 'icon-red';

  return (
    <div className={`stat-card ${statusClass}`}>
      <div className="stat-content">
        <div>
          <p className="stat-text">{title}</p>
          <p className="stat-value">
            {value}
            {status.suffix && <span className="stat-suffix">{status.suffix}</span>}
          </p>
        </div>
        <Icon className={iconClass} />
      </div>
    </div>
  );
};

const App = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    const fetchServiceNowData = async () => {
      setLoading(true);
      try {
        
        const baseUrl = 'https://dev.servicemanagement.nbb.be';
        const endpoint = '/api/now/table/x_nabob_governin_0_topic';
        const params = new URLSearchParams({
          sysparm_fields: 'sys_id,short_description,u_item_start,u_item_end,discussion_time_required,schedule_clearance,postpone,type_of_note',
          sysparm_query: 'agenda.nameSTARTSWITHBoard of Directors 2027-05-11',
          sysparm_display_value: 'true'
        });

        const response = await fetch(`${baseUrl}${endpoint}?${params}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Basic bXVrdW50aHI6TXVrbnV2ITIzMiE='

          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const formattedItems = data.result.map((item, index) => ({
          id: index.toString(),
          agendaItem: item.short_description,
          startTime: item.u_item_start || '00:00:00',
          endTime: item.u_item_end || '00:00:00',
          duration: item.discussion_time_required || 'Not specified',
          noteType: item.type_of_note,
          order: (index + 1).toString(),
          schedule: item.schedule_clearance === 'true',
          postpone: item.postpone || 'No'
        }));

        setItems(formattedItems);
      } catch (error) {
        console.error('Error fetching ServiceNow data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceNowData();
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.currentTarget.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
      order: (idx + 1).toString()
    }));

    setTimeout(() => {
      setItems(updatedItems);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="agenda-container">
      <h1 className="agenda-title">Agenda Management Workspace</h1>

      <div className="stats-grid">
        <StatCard 
          icon={ListOrdered} 
          title="Order" 
          value={items.filter(item => item.order).length}
          status={{
            value: items.filter(item => item.order).length,
            threshold: items.length,
            suffix: `/ ${items.length}`
          }}
        />
        <StatCard 
          icon={CheckSquare} 
          title="Schedule" 
          value={items.filter(item => item.schedule).length}
          status={{
            value: items.filter(item => item.schedule).length,
            threshold: Math.ceil(items.length * 0.8),
            suffix: `/ ${items.length}`
          }}
        />
        <StatCard 
          icon={Clock} 
          title="Timeline" 
          value="On Track"
          status={{
            value: 1,
            threshold: 1
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
                  <span className="note-type-badge">
                    {item.noteType}
                  </span>
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
    </div>
  );
};

export default App;