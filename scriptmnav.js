// Constants (Update Bitcoin holdings manually based on earnings reports)
const BTC_HOLDINGS = 190000; // Approximate MSTR BTC holdings (update regularly)
const SHARES_OUTSTANDING = 15700000; // Approximate MSTR shares outstanding (update regularly)

// Fetch data from Yahoo Finance API
async function fetchStockAndNAVData() {
    const mstrUrl = "https://query1.finance.yahoo.com/v8/finance/chart/MSTR?range=1mo&interval=1d";
    const btcUrl = "https://query1.finance.yahoo.com/v8/finance/chart/BTC-USD?range=1mo&interval=1d";

    const [mstrResponse, btcResponse] = await Promise.all([
        fetch(mstrUrl),
        fetch(btcUrl)
    ]);

    const mstrData = await mstrResponse.json();
    const btcData = await btcResponse.json();

    // Extract MSTR stock price data
    const mstrTimestamps = mstrData.chart.result[0].timestamp;
    const mstrPrices = mstrData.chart.result[0].indicators.quote[0].close;

    // Extract BTC price data
    const btcTimestamps = btcData.chart.result[0].timestamp;
    const btcPrices = btcData.chart.result[0].indicators.quote[0].close;

    // Create NAV dataset (Align timestamps for both datasets)
    let stockData = [];
    for (let i = 0; i < mstrTimestamps.length; i++) {
        let date = new Date(mstrTimestamps[i] * 1000);
        let btcPrice = btcPrices[i] || btcPrices[btcPrices.length - 1]; // Use last available BTC price if missing
        let nav = (BTC_HOLDINGS * btcPrice) / SHARES_OUTSTANDING; // NAV Calculation

        stockData.push({
            date: date,
            price: mstrPrices[i], // MSTR stock price
            nav: nav               // NAV value
        });
    }

    drawChart(stockData);
}

// Function to draw MSTR stock price & NAV chart with D3.js
function drawChart(data) {
    const svg = d3.select("svg"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = {top: 20, right: 50, bottom: 30, left: 50};

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => Math.min(d.price, d.nav)) * 0.9, 
                 d3.max(data, d => Math.max(d.price, d.nav)) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const linePrice = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.price))
        .curve(d3.curveMonotoneX);

    const lineNAV = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.nav))
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

    // Line for MSTR price
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", linePrice);

    // Line for NAV
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5") // Dashed line for NAV
        .attr("d", lineNAV);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 150},${margin.top})`);

    legend.append("rect").attr("width", 12).attr("height", 12).attr("fill", "steelblue");
    legend.append("text").attr("x", 20).attr("y", 10).text("MSTR Stock Price").attr("font-size", "12px");

    legend.append("rect").attr("x", 0).attr("y", 20).attr("width", 12).attr("height", 12).attr("fill", "orange");
    legend.append("text").attr("x", 20).attr("y", 30).text("NAV Estimate").attr("font-size", "12px");
}

// Fetch and visualize stock + NAV data
fetchStockAndNAVData();
