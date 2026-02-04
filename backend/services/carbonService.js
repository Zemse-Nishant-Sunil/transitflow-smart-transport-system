class CarbonService {
    constructor() {
        // grams CO2 per passenger-km for simple modes
        this.factors = {
            walk: 0,
            bicycle: 21, // e-bike or similar
            bus: 105,
            metro: 41,
            local_train: 30,
            car: 271,
            taxi: 271,
            flight: 255
        };
    }

    // route: { segments: [{ mode, distance_km }] }
    estimateRoute(route) {
        const totals = {
            co2_grams: 0,
            legs: []
        };

        route.segments.forEach(seg => {
            const mode = seg.mode || 'walk';
            const distance = seg.distance || 0; // assume km
            const factor = this.factors[mode] || 100; // fallback
            const grams = factor * distance;

            totals.co2_grams += grams;
            totals.legs.push({ mode, distance, grams });
        });

        totals.co2_kg = +(totals.co2_grams / 1000).toFixed(3);
        return totals;
    }
}

module.exports = new CarbonService();
