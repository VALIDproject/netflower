/**
* Created by Florian on 12.04.2017.
*/

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import {MAppViews} from './app';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {AppConstants} from './app_constants';

class SankeyDiagram implements MAppViews {

  private $node;


  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
    .append('div')
    .classed('sankey_diagram', true);
  }

  /**
  * Initialize the view and return a promise
  * that is resolved as soon the view is completely initialized.
  * @returns {Promise<SankeyDiagram>}
  */
  init() {
    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
  * Build the basic DOM elements
  */
  private build() {
    this.$node.append('div').attr('class', 'left_bars');
    this.$node.append('div').attr('class', 'sankey_vis');
    this.$node.append('div').attr('class', 'right_bars');

    //this.buildSankey();
  }

  /**
  * Attach the event listeners
  */
  private attachListener() {
    events.on(AppConstants.EVENT_DATA_PARSED, (evt, data) => {
      //Draw Sankey Diagram
      this.buildSankey(data);
    });
  }


  private buildSankey(json) {

    let sankey = (<any>d3).sankey();

    const units = '€';

    let widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    // console.log('width',  widthNode);

    let heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;
    //console.log('height',  heightNode);

    const margin = {top: 10, right: 120, bottom: 10, left: 120};
    const width =  widthNode  - margin.left - margin.right;
    const height = heightNode - margin.top - margin.bottom;

    // The "0" option enables zero-padding.
    //The comma (",") option enables the use of a comma for a thousands separator.
    const formatNumber = d3.format(',.0f'),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scale.category20();

    // append the svg canvas to the page
    const svg = d3.select(".sankey_vis").append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform','translate(' + margin.left+ ',' + margin.top + ')');

    sankey.nodeWidth(35)
    .nodePadding(20)
    .size([width, height]);

    const path = sankey.link();

    //Group Data
    let nest = (<any>d3).nest()
    .key(function (d) {return d.quartal;})
    .entries(json);

    let graph = {'nodes' : [], 'links' : []};
    //console.log(graph);

    nest.forEach(function (d, i ) {
      //console.log('d,i,values, key', d, i, d.values, d.key);
      if (d.key === '20151') {
        //console.log('rechtstraeger', d.values[0].rechtstraeger);
        for(var _v = 0; _v < 20; _v++) {
          //console.log(_v, d);
          graph.nodes.push({ 'name': d.values[_v].rechtstraeger });//all Nodes
          graph.nodes.push({ 'name': d.values[_v].mediumMedieninhaber });//all Nodes
          graph.links.push({ 'source': d.values[_v].rechtstraeger,
          'target': d.values[_v].mediumMedieninhaber,
          'value': +d.values[_v].euro });
        }
      }
    });

    graph.nodes = (<any>d3).keys((<any>d3).nest()
    .key((d) => {return d.name;})
    .map(graph.nodes));

    let text;
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });


    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { 'name': d };
    });

    sankey
    .nodes(graph.nodes)
    //.links(linksorted)
    .links(graph.links)
    .layout(10);


    let link = svg.append('g').selectAll('.link')
    .data(graph.links)
    .enter().append('path')
    .attr('class', 'link')
    .attr('d', path)
    .style('stroke-width', function(d) { return Math.max(1, d.dy); })
    //reduce edges crossing
    .sort(function(a, b) { return b.dy - a.dy; });

    link
    .on("click", function(d) {
      events.fire(AppConstants.EVENT_CLICKED_PATH, d);
    });



    // add the link titles - Hover Path
    link.append('title')
    .text(function(d) {
      return d.source.name + ' → ' +
      d.target.name + '\n' + format(d.value); });


      // add in the nodes
      let node = svg.append('g').selectAll('.node')
      .data(graph.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });


      // add the rectangles for the nodes
      node.append('rect')
      .attr('height', function(d) { return d.dy; })
      .attr('width', sankey.nodeWidth())
      .style('fill', '#DA5A6B')
      //Title rectangle
      .append('title')
      .text(function(d) {
        return d.name + '\n' + format(d.value); });

        //add in the title for the nodes
        let heading =  node.append('g').append('text')
        .attr('x', 45)
        .attr('y', function(d) { return d.dy / 2; }) //in der Mitte des Nodes positionieren
        .attr('dy', '.2em')
        .attr('text-anchor', 'start')
        .attr('transform', null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        //Node Text left
        .attr('x', -45 + sankey.nodeWidth())
        .attr('text-anchor', 'end');

        //width of Text
        let widthText = this.$node.selectAll('text').node().getBoundingClientRect().width;

        if(widthText >= 165 ) {
          //console.log('heading', heading);
          this.wrap(heading, widthText);
        }
      }
      //splitting Text to fit in svg frame
      private wrap (text, widthText) {
        //console.log('wrapping');
        text.each(function() {
          //console.log('selections', d3.selectAll('text'));
          let text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr('y'),
          dy = parseFloat(text.attr('dy')),
          tspan = text.text(null).append('tspan')
          .attr('x', 0).attr('y', y)
          .attr('dy', dy + 'em');

          //console.log('text', text, 'words', words, 'y', y, 'dy', dy, 'tspan', tspan, 'widthText', widthText);
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));

            if (widthText >= 165) {
              line.pop();
              tspan.text(line.join(' '));
              line = [word];
              tspan = text.append('tspan').attr('x', -15).attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em')
              .text(word);
            }
          }
        });
      }
    }

    /**
    * Factory method to create a new SankeyDiagram instance
    * @param parent
    * @param options
    * @returns {SankeyDiagram}
    */
    export function create(parent: Element, options: any) {
      return new SankeyDiagram(parent, options);
    }
