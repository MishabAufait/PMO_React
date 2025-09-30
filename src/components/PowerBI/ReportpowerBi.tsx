import * as React from 'react';
import './ReportpowerBi.scss';

const ReportpowerBi: React.FC = () => {
  return (
    <div className="report-container">
      <iframe
        title="TTL_PBI"
        src="https://app.fabric.microsoft.com/reportEmbed?reportId=1644806f-9118-4d54-bd43-6988ff996e94"
        width="100%"
        height="100%"
        frameBorder={0}
        allowFullScreen
      />
    </div>
  );
};

export default ReportpowerBi;
