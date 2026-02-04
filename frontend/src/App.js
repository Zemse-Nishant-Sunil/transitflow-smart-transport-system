import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Navigation from './components/Navigation';
import JourneyPlanner from './pages/JourneyPlanner';
import LiveTracking from './pages/LiveTracking';
import Analytics from './pages/Analytics';
import Disruptions from './pages/Disruptions';
import Settings from './pages/Settings';
import Badges from './pages/Badges';
import './App.css';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_URL);

        newSocket.on('connect', () => {
            console.log('Connected to server');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnected(false);
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <Router>
            <div className="app">
                <Navigation connected={connected} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/journey-planner" replace />} />
                        <Route path="/journey-planner" element={<JourneyPlanner socket={socket} />} />
                        <Route path="/live-tracking" element={<LiveTracking socket={socket} />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/disruptions" element={<Disruptions socket={socket} />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/badges" element={<Badges />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;