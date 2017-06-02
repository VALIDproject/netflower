/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {AppConstants} from './app_constants';
import {MAppViews} from './app';
import {d3TextWrap} from './utilities';
import FilterPipeline from './filters/filterpipeline';


class SankeyDiagram implements MAppViews {

  private $node;
  private nodesToShow: number = 20;
  private pipeline: FilterPipeline;

  constructor(parent: Element, private options: any) {
    //Create FilterPipeline
    this.pipeline = FilterPipeline.getInstance();

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
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    let dataAvailable = localStorage.getItem('dataLoaded') == 'loaded' ? true : false;
    if(dataAvailable) {
      this.getStorageData();
    }

    events.on(AppConstants.EVENT_DATA_PARSED, (evt, data) => {
      //Draw Sankey Diagram
      this.getStorageData();
    });

    events.on(AppConstants.EVENT_FILTER_CHANGED, (evt, data) => {
      this.$node.select('.sankey_vis').html("");
      //Redraw Sankey Diagram
      this.getStorageData();
    });
  }

  /**
   * Just a handy mehtod that can be called whenever the page is reloaded or when the data is ready.
   */
  private getStorageData() {
    localforage.getItem('data').then((value) => {
      value = this.pipeline.performFilters(value);
      this.buildSankey(value);
    });
  }

  /**
   * This function draws the whole sankey visualization by using the data which is passed from the storage.
   * @param json data from the read functionality
   */
  private buildSankey(json) {
    const that = this;
    const sankey = (<any>d3).sankey();
    const units = '€';

    let widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    let heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;

    const margin = { top: 10, right: 120, bottom: 10, left: 120 };
    const width =  widthNode  - margin.left - margin.right;
    const height = heightNode - margin.top - margin.bottom;

    //The "0" option enables zero-padding. The comma (",") option enables the use of a comma for a thousands separator.
    const formatNumber = d3.format(',.0f'),    // zero decimal places
      format = function(d) { return formatNumber(d) + ' ' + units; }; //Display number with unit sign

    //Append the svg canvas t the page
    const svg = d3.select('.sankey_vis').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform','translate(' + margin.left+ ',' + margin.top + ')');

    //Set the diagram properties
    sankey.nodeWidth(35)
      .nodePadding(20)
      .size([width, height]);

    const path = sankey.link();

    //Group Data (by quartal)
    let nest = (<any>d3).nest()
      .key(function (d) {return d.quartal;})
      .entries(json);

    let graph = {'nodes' : [], 'links' : []};

    nest.forEach(function (d, i ) {
      if (d.key === '20151' || d.key === '20152') {
        for(var _v = 0; _v < that.nodesToShow; _v++) {;
          //console.log(_v, d);
          graph.nodes.push({ 'name': d.values[_v].rechtstraeger });//all Nodes
          graph.nodes.push({ 'name': d.values[_v].mediumMedieninhaber });//all Nodes
          graph.links.push({ 'source': d.values[_v].rechtstraeger,
            'target': d.values[_v].mediumMedieninhaber,
            'value': + d.values[_v].euro });
        }
      }
    });

    //d3.keys - returns array of keys from the nest function
    //d3.nest - groups the values of an array by the given key
    //d3.map - constructs a new map and copies all enumerable properties from the specified object into this map.
    graph.nodes = (<any>d3).keys((<any>d3).nest()
      .key((d) => {return d.name;})
      .map(graph.nodes));

    let text;
    graph.links.forEach(function (d, i) {
      graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
      graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    //This makes out of the array of strings a array of objects with the key 'name'
    graph.nodes.forEach(function (d, i) {
      graph.nodes[i] = { 'name': d };
    });

    //Basic parameters for the diagram
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


    //Add the link titles - Hover Path
    link.append('title')
      .text(function(d) {
        return d.source.name + ' → ' +
          d.target.name + '\n' + format(d.value);
      });

    //Add the on 'click' listener for the links
    link.on('click', function(d) {
      events.fire(AppConstants.EVENT_CLICKED_PATH, d, json);
    });

    //Add in the nodes
    let node = svg.append('g').selectAll('.node')
      .data(graph.nodes)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

    //Add the rectangles for the nodes
    node.append('rect')
      .attr('height', function(d) { return d.dy; })
      .attr('width', sankey.nodeWidth())
      .style('fill', '#DA5A6B')
      //Title rectangle
      .append('title')
      .text(function(d) {
        return d.name + '\n' + format(d.value);
      });

    //Add in the title for the nodes
    let heading = node.append('g').append('text')
      .attr('x', 45)
      .attr('y', function(d) { return d.dy / 2; }) //Place in middle of node
      .attr('dy', '.2em')
      .attr('text-anchor', 'start')
      .text(function(d) { return d.name; })
      .filter(function(d, i) { return d.x < width / 2; })
      //Node Text left if filter function is true
      .attr('x', -45 + sankey.nodeWidth())
      .attr('text-anchor', 'end');

    //TODO: FG: Call the function with .call or .each d3TextWrap and pass depenendt arguments
    // //Wrap the text
    // let widthText = this.$node.selectAll('text').node().getBoundingClientRect().width;
    //
    // if(widthText >= 165 ) {
    //   this.wrap(this.$node.selectAll('text'), 60);
    // }
  }

  /**
   * This function wraps the text in order to fit it to the svg size.
   * @param text object to wrap
   * @param widthText width of the text object
   *
   * @see: from http://bl.ocks.org/mbostock/7555321
   */
  // private wrap(text, width) {
  //   text.each(function() {
  //     let text = d3.select(this),
  //       words = text.text().split(/\s+/).reverse(),
  //       word,
  //       line = [],
  //       lineNumber = 0,
  //       lineHeight = 1, // ems
  //       y = text.attr("y"),
  //       dy = parseFloat(text.attr("dy")) || 0;
  //
  //     let tspan = (text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em") as any);
  //     while (word = words.pop()) {
  //       line.push(word);
  //       tspan.text(line.join(" "));
  //       if (tspan.node().getComputedTextLength() > width) {
  //         line.pop();
  //         tspan.text(line.join(" "));
  //         line = [word];
  //         tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", (++lineNumber * lineHeight + dy) + "em").text(word);
  //       }
  //     }
  //   });
  // }
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
