import React, { useState } from 'react';
import { Clock, IndianRupee, TrendingUp, MapPin, Train, Bus, Navigation2, User, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import './RouteCard.css';

const getModeIcon = (mode) => {
    const icons = {
        local_train: Train,
        metro: Train,
        bus: Bus,
        auto: Navigation2,
        walk: User
    };
    return icons[mode] || MapPin;
};

function RouteCard({ route, index, selected, onSelect }) {
    const [expanded, setExpanded] = useState(false);

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const getBadgeClass = (reliability) => {
        if (reliability >= 0.8) return 'badge-success';
        if (reliability >= 0.6) return 'badge-warning';
        return 'badge-danger';
    };

    return (
        <div className={`route-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
            <div className="route-header">
                <div className="route-badge">Route {index + 1}</div>
                <div className="route-stats">
                    <div className="stat">
                        <Clock size={16} />
                        <span>{formatDuration(route.totalDuration)}</span>
                    </div>
                    <div className="stat">
                        <IndianRupee size={16} />
                        <span>₹{route.totalCost}</span>
                    </div>
                    <div className="stat">
                        <TrendingUp size={16} />
                        <span>{route.transfers} transfer{route.transfers !== 1 ? 's' : ''}</span>
                    </div>
                </div>
                <span className={`badge ${getBadgeClass(route.reliability)}`}>
                    {Math.round(route.reliability * 100)}% reliable
                </span>
            </div>

            <div className="route-modes">
                {route.segments.map((segment, idx) => {
                    const Icon = getModeIcon(segment.mode);
                    return (
                        <React.Fragment key={segment.id}>
                            <div className={`mode-icon ${segment.mode}`}>
                                <Icon size={18} />
                            </div>
                            {idx < route.segments.length - 1 && (
                                <ArrowRight size={16} className="mode-arrow" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <button
                className="expand-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }}
            >
                {expanded ? (
                    <>
                        <ChevronUp size={16} />
                        Hide Details
                    </>
                ) : (
                    <>
                        <ChevronDown size={16} />
                        View Details
                    </>
                )}
            </button>

            {expanded && (
                <div className="route-segments fade-in">
                    {route.segments.map((segment, idx) => {
                        const Icon = getModeIcon(segment.mode);
                        return (
                            <div key={segment.id} className="segment">
                                <div className="segment-icon">
                                    <Icon size={20} />
                                </div>
                                <div className="segment-details">
                                    <div className="segment-route">
                                        <span className="segment-from">{segment.from}</span>
                                        <ArrowRight size={14} />
                                        <span className="segment-to">{segment.to}</span>
                                    </div>
                                    <div className="segment-info">
                                        <span className="mode-label">{segment.line || segment.mode.replace('_', ' ')}</span>
                                        <span>•</span>
                                        <span>{formatDuration(segment.duration)}</span>
                                        <span>•</span>
                                        <span>₹{segment.cost || 0}</span>
                                    </div>
                                    {segment.instructions && (
                                        <p className="segment-instructions">{segment.instructions}</p>
                                    )}
                                    {segment.crowdLevel && (
                                        <span className={`crowd-badge crowd-${segment.crowdLevel}`}>
                                            {segment.crowdLevel} crowd
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default RouteCard;