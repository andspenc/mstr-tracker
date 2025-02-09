const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Allow CORS for frontend requests
app.use(cors());

// Constants (Update as needed)
const BTC_HOLDINGS = 190000;  // MSTR's Bitcoin holdings (update from filings)
const SHARES_OUTSTANDING = 15700000; // MSTR's shares outstanding

// Yahoo Finance API endpoints
const BTC_URL = "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?range=1mo&interval=1d";
const MSTR_URL = "https://query1.finance.yahoo.com/v8/finance/chart/MSTR?range=1mo&interval=1d";

// Fetch MSTR Stock Price
app.get('/api/mstr', async (req, res) => {
    try {
        const response = await axios.get(MSTR_URL);
        const result = response.data.chart.result[0];

        const data = result.timestamp.map((timestamp, index) => ({
            date: new Date(timestamp * 1000),
            price: result.indicators.quote[0].close[index]
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch MSTR data" });
    }
});

// Fetch BTC Price
app.get('/api/btc', async (req, res) => {
    try {
        const response = await axios.get(BTC_URL);
        const result = response.data.chart.result[0];

        const data = result.timestamp.map((timestamp, index) => ({
            date: new Date(timestamp * 1000),
            price: result.indicators.quote[0].close[index]
        }));

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch BTC data" });
    }
});

// Fetch MSTR NAV per Share
app.get('/api/nav', async (req, res) => {
    try {
        const [btcResponse, mstrResponse] = await Promise.all([
            axios.get(BTC_URL),
            axios.get(MSTR_URL)
        ]);

        const btcData = btcResponse.data.chart.result[0];
        const mstrData = mstrResponse.data.chart.result[0];

        const navData = btcData.timestamp.map((timestamp, index) => ({
            date: new Date(timestamp * 1000),
            btcPrice: btcData.indicators.quote[0].close[index],
            nav: (BTC_HOLDINGS * btcData.indicators.quote[0].close[index]) / SHARES_OUTSTANDING,
            mstrPrice: mstrData.indicators.quote[0].close[index] || mstrData.indicators.quote[0].close[mstrData.indicators.quote[0].close.length - 1]
        }));

        res.json(navData);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch NAV data" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
