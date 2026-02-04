import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function CrowdIndicator({ station, time }) {
    const [prediction, setPrediction] = useState(null);

    useEffect(() => {
        if (!station) return;
        const hour = time ? new Date(time).getHours() : new Date().getHours();
        axios.get(`${API_URL}/api/prediction/station`, { params: { station, hour } }).then(r => setPrediction(r.data.prediction)).catch(err => console.error(err));
    }, [station, time]);

    if (!prediction) return <div className="crowd-indicator">—</div>;

    return (
        <div className={`crowd-indicator level-${prediction.predictedLevel}`}>
            <strong>{prediction.predictedLevel.replace('_', ' ').toUpperCase()}</strong>
            <div>{Math.round(prediction.score)}% likelihood</div>
        </div>
    );
}
