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

  //Variables for the temporary nodes to show more
  private tempNodeLeft: string = 'Others';
  private tempNodeRight: string = 'More';
  private tempNodeVal: number = 20000;

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
      this.$node.select('.sankey_vis').html('');
      //Redraw Sankey Diagram
      this.getStorageData();
    });
  }

  /**
   * Just a handy method that can be called whenever the page is reloaded or when the data is ready.
   */
  private getStorageData() {
    localforage.getItem('data').then((value) => {
      //Store the unfiltered data too
      let originalData = value;

      //Filter the data before and then pass it to the draw function.
      let filteredData = this.pipeline.performFilters(value);

      this.buildSankey(filteredData, originalData);
    });
  }

  /**
   * This function draws the whole sankey visualization by using the data which is passed from the storage.
   * @param json data from the read functionality
   */
  private buildSankey(json, origJson) {
    const that = this;
    const sankey = (<any>d3).sankey();
    const units = '€';

    let widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    let heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;

    const margin = { top: 10, right: 120, bottom: 10, left: 120 };
    const width =  widthNode  - margin.left - margin.right;
    const height = heightNode - margin.top - margin.bottom;
    const widthOffset = 30;

    //The "0" option enables zero-padding. The comma (",") option enables the use of a comma for a thousands separator.
    const formatNumber = d3.format(',.0f'),    // zero decimal places
      format = function(d) { return formatNumber(d) + ' ' + units; }; //Display number with unit sign

    //This method splits the given string at a given position (method used is currying, which means 2 fat arrows,
    //where the first returns a funciton. So everytime the function is called the same index is used for example.
    const splitAt = index => it =>
      [it.slice(0, index), it.slice(index)];

    //Append the svg canvas t the page
    const svg = d3.select('.sankey_vis').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform','translate(' + margin.left+ ',' + margin.top + ')');

    //Set the diagram properties
    sankey.nodeWidth(35)
      .nodePadding(20)
      .size([width - widthOffset, height]);

    const path = sankey.link();

    //Group Data (by quartal)
    let nest = (<any>d3).nest()
      .key(function (d) {return d.timeNode;})
      .entries(json);

    let graph = {'nodes' : [], 'links' : []};

    that.nodesToShow = Math.ceil((heightNode / 40) / nest.length);    //Trying to make nodes length dependent on space

    nest.forEach(function (d, i ) {
      for(var _v = 0; _v < that.nodesToShow; _v++) {;
        graph.nodes.push({ 'name': d.values[_v].sourceNode });//all Nodes
        graph.nodes.push({ 'name': d.values[_v].targetNode });//all Nodes
        graph.links.push({ 'source': d.values[_v].sourceNode,
          'target': d.values[_v].targetNode,
          'value': +d.values[_v].valueNode, 'time': d.values[_v].timeNode });
      }
    });

    //d3.keys - returns array of keys from the nest function
    //d3.nest - groups the values of an array by the given key
    //d3.map - constructs a new map and copies all enumerable properties from the specified object into this map.
    graph.nodes = (<any>d3).keys((<any>d3).nest()
      .key((d) => {return d.name;})
      .map(graph.nodes));

    //Add the fake node from last to 'more'
    const lastSource = graph.links[graph.links.length - 1].source;
    graph.links.push({'source': lastSource, 'target': this.tempNodeRight, 'time': '0', 'value': 0});

    //Add fake nodes generally
    graph.nodes.push(this.tempNodeLeft);
    graph.nodes.push(this.tempNodeRight);
    graph.links.push({'source': this.tempNodeLeft, 'target': this.tempNodeRight,
      'time':  '0', 'value': this.tempNodeVal});

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
        if(d.source.name == that.tempNodeLeft || d.target.name == that.tempNodeRight) {
          return d.source.name + ' → ' +
            d.target.name;
        } else {
          return d.source.name + ' → ' +
            d.target.name + '\n' + format(d.value) + ' in '
            + splitAt(4)(d.time)[0] + 'Q' + splitAt(4)(d.time)[1];
        }
      });

    //Add the on 'click' listener for the links
    link.on('click', function(d) {
      events.fire(AppConstants.EVENT_CLICKED_PATH, d, origJson);
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
        if(d.name == that.tempNodeLeft || d.name == that.tempNodeRight) {
          return `${d.name}`;
        } else {
          return d.name + '\n' + format(d.value);
        }
      });

    //Add in the title for the nodes
    let heading = node.append('g').append('text')
      .attr('x', 45)
      .attr('y', function(d) { return (d.dy / 2) - 10;})
      .attr('dy', '1.0em')
      .attr('text-anchor', 'start')
      .attr('class', 'rightText')
      .text(function(d) {
        if(d.name == that.tempNodeLeft || d.name == that.tempNodeRight) {
          return `${d.name}`;
        } else {
          return `${format(d.value)} ${d.name}`;
        }
      })
      .filter(function(d, i) { return d.x < width / 2})
      .attr('x', -45 + sankey.nodeWidth())
      .attr('text-anchor', 'end')
      .attr('class', 'leftText');

    //The strange word wrapping. Needs to be reworked based on the svg size the
    //sankey diagram size and the words and text size.
    const leftWrap = this.$node.selectAll('.leftText');
    const rightWrap = this.$node.selectAll('.rightText');
    const leftTextWidth = leftWrap.node().getBoundingClientRect().width;
    const rightTextWidth = rightWrap.node().getBoundingClientRect().width;
    const svgBox = {
      'width': width + margin.left + margin.right,
      'height': height + margin.top + margin.bottom
    };
    const wordWrapBorder = (svgBox.width - width) / 2;

    if(leftTextWidth > wordWrapBorder) {
      d3TextWrap(leftWrap, wordWrapBorder);
      leftWrap.attr('transform', 'translate(' + (wordWrapBorder + 5) * (-1) + ', 0)');
    }
    if(rightTextWidth > wordWrapBorder) {
      d3TextWrap(rightWrap, wordWrapBorder + 10);
      rightWrap.attr('transform', 'translate(' + ((wordWrapBorder - 45) / 2) + ', 0)');
    }
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
