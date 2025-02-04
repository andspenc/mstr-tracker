// Fetch stock data from Alpha Vantage API
async function fetchStockData() {
    const apiKey = "YOUR_API_KEY";
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSTR&apikey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // Extract time series data
    const timeSeries = data["Time Series (Daily)"];
    let stockData = Object.keys(timeSeries).map(date => ({
        date: new Date(date),
        price: parseFloat(timeSeries[date]["4. close"])
    }));

    // Sort by date (ascending order)
    stockData.sort((a, b) => a.date - b.date);

    drawChart(stockData);
}

// Function to draw chart with D3.js
function drawChart(data) {
    const svg = d3.select("svg"),
          width = +svg.attr("width"),
          height = +svg.attr("height"),
          margin = {top: 20, right: 30, bottom: 30, left: 50};

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.price) * 0.9, d3.max(data, d => d.price) * 1.1])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.price))
        .curve(d3.curveMonotoneX);

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Line chart
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);
}

// Fetch and visualize stock data
fetchStockData();
