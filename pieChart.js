const width = 800; 
const height = 500;
const radius = Math.min(width, height) / 2;

const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${width / 2 - 100}, ${height / 2})`); 

const color = d3.scaleOrdinal(d3.schemeCategory10);

const pie = d3.pie()
    .value(d => d.value);

const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

const arcHover = d3.arc()
    .innerRadius(0)
    .outerRadius(radius - 5); 

const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)
    .style('position', 'absolute')
    .style('background-color', '#fff')
    .style('border', '1px solid #ddd')
    .style('padding', '5px')
    .style('border-radius', '3px');

d3.csv('spotifyData.csv').then(data => {
    data.forEach(d => {
        d['Spotify Popularity'] = +d['Spotify Popularity']; // Convert to number
    });

    // Sort by Track Score
    const sortedSongs = data.sort((a, b) => b['Track Score'] - a['Track Score']);
    
    // Get top 10 but skip the 9th song (index 8)
    const top10Songs = sortedSongs.filter((d, index) => index !== 8).slice(0, 10);

    // Filter out songs with missing or invalid Spotify Popularity
    const validSongs = top10Songs.filter(d => !isNaN(d['Spotify Popularity']));

    // Prepare data for pie chart
    const aggregatedData = validSongs.map(d => ({
        category: d['Track'], // Use 'Track' for song titles
        artist: d['Artist'], // Use 'Artist' for artist names
        value: d['Spotify Popularity']
    }));

    const totalValue = d3.sum(aggregatedData, d => d.value);

    const arcs = svg.selectAll('.arc')
        .data(pie(aggregatedData))
        .enter().append('g')
        .attr('class', 'arc');

    arcs.append('path')
        .attr('d', arc)
        .attr('class', 'slice')
        .attr('fill', d => color(d.data.category))
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arcHover);

            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            tooltip.html(`${d.data.category}<br> Artist: ${d.data.artist}<br>${Math.round((d.data.value / totalValue) * 100)}%`)
                .style('left', `${event.pageX + 5}px`)
                .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('d', arc);

            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });

    arcs.append('text')
        .attr('transform', d => `translate(${arc.centroid(d)})`)
        .attr('dy', '.35em')
        .attr('text-anchor', 'middle')
        .text(d => d.data.category)
        .style('font-size', '12px')
        .style('fill', '#fff');

    // Add legend
    const legendWidth = 200;
    const legendHeight = height;

    const legend = d3.select('body').append('svg')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .attr('class', 'legend')
    .style('position', 'absolute')
    .style('left', `${width}px`) 
    .style('top', '250px'); 

    const legendItems = legend.selectAll('.legend-item')
        .data(aggregatedData)
        .enter().append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25})`); 

    legendItems.append('rect')
        .attr('x', 0)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => color(d.category));

    legendItems.append('text')
        .attr('x', 25)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .text(d => d.category)
        .style('font-size', '12px')
        .style('fill', '#000');

    document.getElementById('backButton').addEventListener('click', () => {
            window.location.href = 'index.html'; // Navigate back to pieChart.html
          });
         
}).catch(error => {
    console.error('Error loading or parsing data:', error);
});
