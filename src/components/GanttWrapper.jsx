import { useEffect, useRef } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';

const GanttWrapper = ({ ganttData }) => {
  const ganttContainer = useRef(null);

  useEffect(() => {
    if (ganttContainer.current && ganttData) {
      // Configure Gantt
      gantt.config.date_format = "%Y-%m-%d";
      gantt.config.scale_unit = "day";
      gantt.config.step = 1;
      gantt.config.date_scale = "%d %M";
      gantt.config.subscales = [];
      gantt.config.columns = [
        { name: "text", label: "Task", width: "*", tree: true },
        { name: "start_date", label: "Start", align: "center", width: 80 },
        { name: "duration", label: "Duration", align: "center", width: 60 },
        { name: "owner", label: "Owner", align: "center", width: 100 }
      ];

      // Initialize Gantt
      gantt.init(ganttContainer.current);
      
      // Clear existing data
      gantt.clearAll();
      
      // Parse new data
      gantt.parse(ganttData);
    }

    // Cleanup on unmount
    return () => {
      if (ganttContainer.current) {
        gantt.clearAll();
      }
    };
  }, [ganttData]);

  return (
    <div 
      ref={ganttContainer} 
      style={{ width: '100%', height: '500px' }}
      className="gantt-container"
    />
  );
};

export default GanttWrapper;
