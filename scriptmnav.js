// Constants (Update these manually as per MSTR's latest reports)
const BTC_HOLDINGS = 190000;  // MSTR's Bitcoin holdings
const SHARES_OUTSTANDING = 15700000; // MSTR's shares outstanding

// Yahoo Finance API endpoints
const btcUrl = "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?chartPreviousClose";
const mstrUrl = "https://query1.finance.yahoo.com/v8/finance/chart/MSTR?range=1mo&interval=1d";

// Fetch BTC and MSTR data
async function fetchData() {
    const [btcResponse, mstrResponse] = await Promise.all([
        fetch(btcUrl),
        fetch(mstrUrl)
    ]);

    const btcData = await btcResponse.json();
    const mstrData = await mstrResponse.json();

    // Extract Bitcoin Price Data
    const btcTimestamps = btcData.chart.result[0].timestamp;
    const btcPrices = btcData.chart.result[0].indicators.quote[0].close;

    // Extract MSTR Stock Price Data
    const mstrTimestamps = mstrData.chart.result[0].timestamp;
    const mstrPrices = mstrData.chart.result[0].indicators.quote[0].close;

    // Align timestamps & calculate NAV
    let data = btcTimestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000),
        btcPrice: btcPrices[index],
        nav: (BTC_HOLDINGS * btcPrices[index]) / SHARES_OUTSTANDING,
        mstrPrice: mstrPrices[index] || mstrPrices[mstrPrices.length - 1] // Use last available price if missing
    }));

    drawChart(data);
}

// Function to draw chart using D3.js
function drawChart(data) {
    const svg = d3.select("svg"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = {top: 20, right: 50, bottom: 30, left: 50};

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => Math.min(d.nav, d.mstrPrice)) * 0.9, 
                 d3.max(data, d => Math.max(d.nav, d.mstrPrice)) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const lineNAV = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.nav))
        .curve(d3.curveMonotoneX);

    const lineMSTR = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.mstrPrice))
        .curve(d3.curveMonotoneX);

    // Clear previous content
    svg.selectAll("*").remove();

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Line for NAV per share
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5") // Dashed line for NAV
        .attr("d", lineNAV);

    // Line for MSTR stock price
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", lineMSTR);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 150},${margin.top})`);

    legend.append("rect").attr("width", 12).attr("height", 12).attr("fill", "steelblue");
    legend.append("text").attr("x", 20).attr("y", 10).text("MSTR Stock Price").attr("font-size", "12px");

    legend.append("rect").attr("x", 0).attr("y", 20).attr("width", 12).attr("height", 12).attr("fill", "orange");
    legend.append("text").attr("x", 20).attr("y", 30).text("NAV per Share").attr("font-size", "12px");
}

// Run the fetch function
fetchData();
