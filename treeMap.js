const width = 1200;
const height = 600;
const margin = { top: 20, right: 20, bottom: 20, left: 20 };

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const treemap = d3.treemap()
  .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
  .padding(1);
  const color = d3.scaleOrdinal(d3.schemeCategory10);
function formatStreams(value) {
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + ' B';
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(1) + ' M';
  }
  return value;
}




function removeDuplicates(data) {
  const seen = new Set();
  return data.filter(item => {
    const duplicate = seen.has(item.Track);
    seen.add(item.Track);
    return !duplicate;
  });
}




d3.csv('spotifyData.csv').then(data => {
  let processedData = data.map(d => ({
    "Track": d.Track,
    "Spotify Streams": +d["Spotify Streams"].replace(/,/g, '')
  }));
  processedData = removeDuplicates(processedData);

  const initialData = processedData.slice(0, 10);

  function updateTreeMap(data) {
    const rootData = {
      "Track": "root",
      "children": data
    };

    const root = d3.hierarchy(rootData)
      .sum(d => d["Spotify Streams"]);

    treemap(root);

    const nodes = svg.selectAll('rect')
      .data(root.leaves(), d => d.data.Track);

      nodes.enter().append('rect')
      .attr('class', 'node')
      .merge(nodes)
      .on('mouseover', function(event, d) {
        d3.select(this).transition()
          .duration(200)
          .attr('fill', 'orange')
          .attr('stroke', 'black')
          .attr('stroke-width', '2px')
          .attr('x', d.x0 - 5)
          .attr('y', d.y0 - 5)
          .attr('width', d.x1 - d.x0 + 15)
          .attr('height', d.y1 - d.y0 + 15);
      })
      .on('mouseout', function(event, d) {
        d3.select(this).transition()
          .duration(200)
          .attr('fill', color(d.data.Track))
          .attr('stroke', '#fff')
          .attr('stroke-width', '1px')
          .attr('x', d.x0)
          .attr('y', d.y0)
          .attr('width', d.x1 - d.x0)
          .attr('height', d.y1 - d.y0);
      })
      .transition()
      .duration(750)
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => color(d.data.Track)); 
    nodes.exit().remove();

    const labels = svg.selectAll('text')
      .data(root.leaves(), d => d.data.Track);

    labels.enter().append('text')
      .attr('class', 'label')
      .merge(labels)
      .transition()
      .duration(750)
      .attr('x', d => (d.x0 + d.x1) / 2)
      .attr('y', d => (d.y0 + d.y1) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text(d => `${d.data.Track} (${formatStreams(d.data["Spotify Streams"])})`);

    labels.exit().remove();
  }

  updateTreeMap(initialData);

  let showingMostStreamed = false;

  document.getElementById('toggleButton').addEventListener('click', () => {
    showingMostStreamed = !showingMostStreamed;

    if (showingMostStreamed) {
      const mostStreamedData = processedData
        .sort((a, b) => b["Spotify Streams"] - a["Spotify Streams"])
        .slice(0, 10); 

      updateTreeMap(mostStreamedData);
      document.getElementById('toggleButton').textContent = 'Most Streamed Tracks 2024';
    } else {
      updateTreeMap(initialData);
      document.getElementById('toggleButton').textContent = 'All Time Most Streamed Tracks';
    }
  });


  document.getElementById('backButton').addEventListener('click', () => {
    window.location.href = 'pieChart.html'; // Navigate back to pieChart.html
  });


  
}).catch(error => {
  console.error('Error loading or processing data:', error);
});