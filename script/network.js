/**
 * Created by eileenlyly on 2/20/14.
 */

var width = 1300,
    height = 800;

var force = d3.layout.force()
    .charge( function(d) { return -80 * Math.sqrt(d.count)} )
    .linkDistance(50)
    .gravity(0.9)
    .size([width - 250, height]);

var svg = d3.select(document.getElementById("svgDiv"))
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var toolTip = d3.select(document.getElementById("toolTip"));
var header = d3.select(document.getElementById("header"));
var header1 = d3.select(document.getElementById("header1"));
var header2 = d3.select(document.getElementById("header2"));

d3.json("data/sample.json", function(error, graph) {

    var kind_to_color = function(d){
        if(d.epika > 100) return "#CC99FF";
        return "#33CC66";
    };

    var main = svg.append("g")
        .attr("class", "graph");

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    var link = main.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke",function(d){ return kind_to_color(d); })
        .style("stroke-opacity", 0.2)
        .style("stroke-width", function(d) { return d.count/1000; });

    var node = main.selectAll(".node_circle")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node_circle")
        .attr("r", function(d) { return d.count/100; })
        .style("fill", function(d){ return kind_to_color(d).toString(); } )
        .on("mouseover", function(d) { mouseover_node(d); })
        .on("mouseout", function(d) { mouseout_node(d) })
        .call(force.drag);

    var label = main.selectAll(".node_label")
        .data(graph.nodes)
        .enter().append("text")
        .attr("class", "node_label")
        .attr("dx", function(d) { return 2 + 0.5 * Math.sqrt(d.count); })
        .attr("dy", ".4em")
        .attr("font-family", "Verdana")
        .attr("font-size", 5)
        .style("fill", "#000000")
        .text(function(d) { return d.name; });

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        label.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
    });

    var mouseover_node = function(z){

        var neighbors = {};
        neighbors[z.index] = true;
        var countnb = 0;

        link.filter(function(d){
            if (d.source == z) {
                neighbors[d.target.index] = true
                countnb++
                return true
            } else if (d.target == z) {
                neighbors[d.source.index] = true
                countnb++
                return true
            } else {
                return false
            }
        })
            .style("stroke-opacity", 1);

        node.filter(function(d){ return neighbors[d.index] })
            .style("stroke-width", 3);

        label.filter(function(d){ return !neighbors[d.index] })
            .style("fill-opacity", 0.2);

        label.filter(function(d){ return neighbors[d.index] })
            .attr("font-size", 10);

        toolTip.style("right",  "50px")
            .style("top", "200px")
            .style("height","80px");

        toolTip.transition()
            .duration(200)
            .style("opacity", ".8");

        header.text(z.name);
        header1.text(z.count+" Collaboration");
        header2.text("with "+countnb+ " Users");

    };

    var mouseout_node = function(z){
        link
            .style("stroke-opacity", 0.2);

        node
            .style("stroke-width", 1)

        label
            .attr("font-size", 5)
            .style("fill-opacity", 1)

        toolTip.transition()									// declare the transition properties to fade-out the div
            .duration(400)									// it shall take 500ms
            .style("opacity", "0");

    };

});