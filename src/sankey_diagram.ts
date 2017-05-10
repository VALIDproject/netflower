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

    this.buildSankey();

  }

  /**
   * Attach the event listeners
   */
  private attachListener() {

    events.on(AppConstants.EVENT_DATA_PARSED, (evt, data) => {
      console.log('data: ', data);
    });

  }


  private buildSankey() {

    // console.log(this.$node);

    const sankey = (<any>d3).sankey();
    // console.log('Sankey Object', sankey);

    const units = '€';

    /* let widthNode = this.$node.select('.sankey_vis').node();
     widthNode.getBoundingClientRect().width;
     console.log('width',  widthNode);*/

    let widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    // console.log('width',  widthNode);

    let heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;
    //console.log('height',  heightNode);

    const margin = {top: 10, right: 80, bottom: 10, left: 80};
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
    // console.log('path', path);

    const json =  [
      {'source':'Albertina',
        "target":"Vienna Deluxe Magazine GmbH",
        "value": 17801.84
      },
      {"source":"Albertina",
        "target":"Wien Programm",
        "value":5197.98
      },
      {"source":"Agrarmarkt Austria Marketing GesmbH",
        "target":"Lebensart",
        "value": 5702
      },
      {"source":"Bundeskanzleramt",
        "target":"Wien Programm",
        "value":5197.98
      },
      {'source':'Albertina',
        "target":"Vienna Deluxe Magazine GmbH",
        "value": 17801.84
      },
      {"source":"Albertina",
        "target":"Der Standard",
        "value":4500
      },
      {"source":"Agrarmarkt Austria Marketing GesmbH",
        "target":"Woman",
        "value": 59662.90
      },
      {"source":"Bundeskanzleramt",
        "target":"Kleine Zeitung",
        "value":75068
      },
      {"source":"Bundeskanzleramt",
        "target":"Vienna Deluxe Magazine GmbH",
        "value":6230
      }
    ];
    //console.log(json);

    let graph = {'nodes' : [], 'links' : []};
    //console.log(graph);

    json.forEach(function (d) {
      //console.log("source: ", d.source, "target: ", d.target);
      graph.nodes.push({ 'name': d.source });//all Nodes
      graph.nodes.push({ 'name': d.target });//all Nodes
      graph.links.push({ 'source': d.source,
        'target': d.target,
        'value': +d.value })
    });

    console.log('Graph Array', graph.nodes);

    graph.nodes = d3.keys(d3.nest()
      .key(function (d) {
        console.log('Data nest', d, d.name);
        return d.name;

      })
      .map(graph.nodes));

    //console.log('GraphNodes',graph.nodes);

    let text;
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //console.log('GraphLinks',graph.links);

    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { 'name': d };
    });

    sankey
      .nodes(graph.nodes)
      //.links(linksorted)
      .links(graph.links)
      .layout(10);//32


    let link = svg.append('g').selectAll('.link')
      .data(graph.links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', path)
      .style('stroke-width', function(d) { return Math.max(1, d.dy); })
      //reduce edges crossing
      .sort(function(a, b) { return b.dy - a.dy; });

    // add the link titles HOVER
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
      .style('fill', 'orange')

      //Title rectangle
      .append('title')
      .text(function(d) {
        return d.name + '\n' + format(d.value); });

    // add in the title for the nodes
    node.append('text')
      .attr('x', 10)
      .attr('y', function(d) { return d.dy / 2; }) //in der Mitte des Nodes positionieren
      .attr('dy', '.35em')
      .attr('text-anchor', 'start')
      .attr('transform', null)
      .text(function(d) { return d.name +  ' '  +  '€ ' +  d.value; })
      .filter(function(d) { return d.x < width / 2; })
      //Node Text left
      .attr('x', 2 + sankey.nodeWidth())
      .attr('text-anchor', 'end');



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
