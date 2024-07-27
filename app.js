
var svg = d3.select("svg"),
    margin = { top: 20, right: 20, bottom: 80, left: 100 },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var xScale = d3.scaleBand().range([0, width]).padding(0.3),
    yScale = d3.scaleLinear().range([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("spotifyData.csv").then(data => {
    data.forEach(function(d) {
        d["Track Score"] = +d["Track Score"]; 
    });

    // Sort and slice data
    data.sort((a, b) => b["Track Score"] - a["Track Score"]);
    data = data.slice(0, 10);

    // Set domain for x and y scales
    xScale.domain(data.map(function(d) { return d.Track; }));
    yScale.domain([0, d3.max(data, function(d) { return d["Track Score"]; })]);

    // X Axis
    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Y Axis (without millions conversion)
    g.append("g")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("y", -10)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Track Score"); // Adjusted label to not include conversion to millions

    // X Axis Label
        svg.append("text")
        .attr("x", margin.left + width / 2)
        .attr("y", height + margin.top + 50) // Position below the x-axis
        .attr("text-anchor", "middle")
        .text("Track"); // Label for x-axis

    // Y Axis Label
    svg.append("text")
        .attr("transform", "rotate(-90)") // Rotate text for vertical alignment
        .attr("x", -margin.top - height / 2)
        .attr("y", margin.left - 50) // Position to the left of the y-axis
        .attr("text-anchor", "middle")
        .text("Track Score"); // Label for y-axis
    // Bars
    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.Track); })
        .attr("y", function(d) { return yScale(d["Track Score"]); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(d["Track Score"]); })
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            d3.select(this).transition()
                .duration(200)
                .attr("fill", "orange")
                .attr("height", height - yScale(d["Track Score"]) + 10)
                .attr("y", yScale(d["Track Score"]) - 10);

            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Track Score: " + d["Track Score"])
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).transition()
                .duration(200)
                .attr("fill", "steelblue")
                .attr("height", height - yScale(d["Track Score"]))
                .attr("y", yScale(d["Track Score"]));

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}).catch(error => {
    console.error('Error loading or parsing data:', error);
});
