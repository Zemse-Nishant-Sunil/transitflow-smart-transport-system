// Mock data for different transport modes in Mumbai
const mockTransportData = {
    stations: {
        // Western Line Stations
        'churchgate': { id: 'churchgate', name: 'Churchgate', lat: 18.9322, lng: 72.8264, modes: ['local_train', 'metro'] },
        'marine_lines': { id: 'marine_lines', name: 'Marine Lines', lat: 18.9434, lng: 72.8234, modes: ['local_train'] },
        'charni_road': { id: 'charni_road', name: 'Charni Road', lat: 18.9533, lng: 72.8196, modes: ['local_train'] },
        'grant_road': { id: 'grant_road', name: 'Grant Road', lat: 18.9639, lng: 72.8155, modes: ['local_train'] },
        'mumbai_central': { id: 'mumbai_central', name: 'Mumbai Central', lat: 18.9685, lng: 72.8194, modes: ['local_train', 'metro'] },
        'mahalaxmi': { id: 'mahalaxmi', name: 'Mahalaxmi', lat: 18.9827, lng: 72.8233, modes: ['local_train'] },
        'lower_parel': { id: 'lower_parel', name: 'Lower Parel', lat: 18.9969, lng: 72.8304, modes: ['local_train', 'metro'] },
        'dadar': { id: 'dadar', name: 'Dadar', lat: 19.0176, lng: 72.8432, modes: ['local_train', 'metro', 'bus_terminal'] },
        'bandra': { id: 'bandra', name: 'Bandra', lat: 19.0544, lng: 72.8407, modes: ['local_train', 'metro', 'bus_terminal'] },
        'andheri': { id: 'andheri', name: 'Andheri', lat: 19.1197, lng: 72.8464, modes: ['local_train', 'metro', 'bus_terminal'] },
        'goregaon': { id: 'goregaon', name: 'Goregaon', lat: 19.1645, lng: 72.8489, modes: ['local_train', 'metro'] },
        'malad': { id: 'malad', name: 'Malad', lat: 19.1868, lng: 72.8481, modes: ['local_train'] },
        'kandivali': { id: 'kandivali', name: 'Kandivali', lat: 19.2037, lng: 72.8496, modes: ['local_train'] },
        'borivali': { id: 'borivali', name: 'Borivali', lat: 19.2304, lng: 72.8577, modes: ['local_train', 'metro', 'bus_terminal'] },
        'mira_road': { id: 'mira_road', name: 'Mira Road', lat: 19.2807, lng: 72.8717, modes: ['local_train'] },
        'bhayandar': { id: 'bhayandar', name: 'Bhayandar', lat: 19.3012, lng: 72.8503, modes: ['local_train', 'bus_terminal'] },

        // Central Line Stations
        'csmt': { id: 'csmt', name: 'CSMT', lat: 18.9398, lng: 72.8355, modes: ['local_train', 'metro'] },
        'byculla': { id: 'byculla', name: 'Byculla', lat: 18.9791, lng: 72.8318, modes: ['local_train'] },
        'kurla': { id: 'kurla', name: 'Kurla', lat: 19.0658, lng: 72.8782, modes: ['local_train', 'metro', 'bus_terminal'] },
        'ghatkopar': { id: 'ghatkopar', name: 'Ghatkopar', lat: 19.0864, lng: 72.9081, modes: ['local_train', 'metro'] },
        'vikhroli': { id: 'vikhroli', name: 'Vikhroli', lat: 19.1076, lng: 72.9294, modes: ['local_train'] },
        'kanjurmarg': { id: 'kanjurmarg', name: 'Kanjurmarg', lat: 19.1302, lng: 72.9323, modes: ['local_train', 'metro'] },
        'bhandup': { id: 'bhandup', name: 'Bhandup', lat: 19.1440, lng: 72.9371, modes: ['local_train'] },
        'mulund': { id: 'mulund', name: 'Mulund', lat: 19.1723, lng: 72.9558, modes: ['local_train', 'bus_terminal'] },
        'thane': { id: 'thane', name: 'Thane', lat: 19.1872, lng: 72.9781, modes: ['local_train', 'metro', 'bus_terminal'] },
    },

    routes: {
        local_train: {
            western_line: {
                id: 'western_line',
                name: 'Western Line',
                stations: ['churchgate', 'marine_lines', 'charni_road', 'grant_road', 'mumbai_central',
                    'mahalaxmi', 'lower_parel', 'dadar', 'bandra', 'andheri', 'goregaon',
                    'malad', 'kandivali', 'borivali', 'mira_road', 'bhayandar'],
                avgSpeed: 40, // km/h
                frequency: 5, // minutes
                cost: 10 // base cost in rupees
            },
            central_line: {
                id: 'central_line',
                name: 'Central Line',
                stations: ['csmt', 'byculla', 'dadar', 'kurla', 'ghatkopar', 'vikhroli',
                    'kanjurmarg', 'bhandup', 'mulund', 'thane'],
                avgSpeed: 38, // km/h
                frequency: 6, // minutes
                cost: 10
            }
        },
        metro: {
            line1: {
                id: 'metro_line1',
                name: 'Metro Line 1 (Ghatkopar-Versova)',
                stations: ['ghatkopar', 'andheri'],
                avgSpeed: 35,
                frequency: 8,
                cost: 20
            },
            line2a: {
                id: 'metro_line2a',
                name: 'Metro Line 2A (Dahisar-DN Nagar)',
                stations: ['andheri', 'goregaon', 'borivali'],
                avgSpeed: 38,
                frequency: 10,
                cost: 25
            }
        },
        bus: {
            avgSpeed: 18, // km/h in Mumbai traffic
            frequency: 15, // minutes
            baseCost: 8
        },
        auto: {
            avgSpeed: 22, // km/h
            baseCost: 23, // base fare
            perKmCost: 17 // per km
        },
        walk: {
            avgSpeed: 4 // km/h
        }
    },

    // Common transfer points
    transferHubs: ['dadar', 'andheri', 'kurla', 'bandra', 'thane', 'ghatkopar', 'borivali'],

    // Typical disruptions (for simulation)
    commonDisruptions: [
        { type: 'signal_failure', probability: 0.05, delay: 15 },
        { type: 'crowd', probability: 0.15, delay: 5 },
        { type: 'technical_snag', probability: 0.03, delay: 20 },
        { type: 'weather', probability: 0.08, delay: 10 },
        { type: 'track_maintenance', probability: 0.02, delay: 30 }
    ]
};

module.exports = mockTransportData;