import * as React from 'react';
import './ReportpowerBi.scss';

const ReportpowerBi: React.FC = () => {
    return (
        <div className="report-container">
            <iframe
                title="Project Management PMO"
                width={1140}
                height={1000}
                src="https://app.fabric.microsoft.com/reportEmbed?reportId=8ca3b24c-8af3-4793-b11e-1b2e622084c4&autoAuth=true&ctid=8efa5ce2-86e4-4882-840c-f2578cdf094c"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default ReportpowerBi;
