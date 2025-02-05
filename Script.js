// Constants (Update manually based on MSTR's reports)
const BTC_HOLDINGS = 190000;  // Approximate MSTR Bitcoin holdings
const SHARES_OUTSTANDING = 15700000; // Approximate MSTR shares outstanding

// Yahoo Finance API endpoints
const btcUrl = "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?range=1mo&interval=1d";
const mstrUrl = "https://query1.finance.yahoo.com/v8/finance/chart/MSTR?range=1mo&interval=1d";

// Fetch BTC and MSTR data
async function fetchData() {
    const [btcResponse, mstrResponse] = await Promise.all([
        fetch(btcUrl),
        fetch(mstrUrl)
    ]);

    const btcData = await btcResponse.json();
    const mstrData = await mstrResponse.json();

    // Extract BTC price data
    const btcTimestamps = btcData.chart.result[0].timestamp;
    const btcPrices = btcData.chart.result[0].indicators.quote[0].close;

    // Extract MSTR stock price data
    const mstrTimestamps = mstrData.chart.result[0].timestamp;
    const mstrPrices = mstrData.chart.result[0].indicators.quote[0].close;

    // Align timestamps & calculate NAV
    let data = btcTimestamps.map((timestamp, index) => ({
        date: new Date(timestamp * 1000),
        btcPrice: btcPrices[index],
        nav: (BTC_HOLDINGS * btcPrices[index]) / SHARES_OUTSTANDING,
        mstrPrice: mstrPrices[index] || mstrPrices[mstrPrices.length - 1] // Use last available price if missing
    }));

    drawPriceChart(data);
    drawNAVChart(data);
}

// Draws MSTR Stock Price Over Time
function drawPriceChart(data) {
    drawLineChart(data, "chart-price", "mstrPrice", "steelblue", "MSTR Price");
}

// Draws MSTR vs. NAV Chart
function drawNAVChart(data) {
    drawMultiLineChart(data, "chart-nav", 
        { key: "mstrPrice", color: "steelblue", label: "MSTR Stock Price" },
        { key: "nav", color: "orange", label: "NAV per Share", dashed: true }
    );
}

// Generic function to draw a single line chart
function drawLineChart(data, chartId, key, color, label) {
    const svg = d3.select(`#${chartId}`),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = {top: 20, right: 50, bottom: 30, left: 50};

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d[key]) * 0.9, d3.max(data, d => d[key]) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[key]))
        .curve(d3.curveMonotoneX);

    svg.selectAll("*").remove();

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .text(label);
}

// Generic function to draw two-line comparison chart
function drawMultiLineChart(data, chartId, line1, line2) {
    const svg = d3.select(`#${chartId}`),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = {top: 20, right: 50, bottom: 30, left: 50};

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => Math.min(d[line1.key], d[line2.key])) * 0.9, 
                 d3.max(data, d => Math.max(d[line1.key], d[line2.key])) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const lineFunc = (key, color, dashed) => d3.line()
        .x(d => x(d.date))
        .y(d => y(d[key]))
        .curve(d3.curveMonotoneX);

    svg.selectAll("*").remove();

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", line1.color)
        .attr("stroke-width", 2)
        .attr("d", lineFunc(line1.key, line1.color));

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", line2.color)
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", line2.dashed ? "5,5" : "0")
        .attr("d", lineFunc(line2.key, line2.color));
}

// Run the fetch function
fetchData();
