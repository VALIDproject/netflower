/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import 'imports-loader?d3=d3!../lib/sankey.js';
import 'bootstrap-slider';
import 'style-loader!css-loader!bootstrap-slider/dist/css/bootstrap-slider.css';
import {AppConstants} from './app_constants';
import {MAppViews} from './app';
import {d3TextWrap} from './utilities';
import FilterPipeline from './filters/filterpipeline';
import EntityEuroFilter from './filters/entityEuroFilter';
import MediaEuroFilter from './filters/mediaEuroFilter';
import EntitySearchFilter from './filters/entitySearchFilter';
import MediaSearchFilter from './filters/mediaSearchFilter';
import PaymentEuroFilter from './filters/paymentEuroFilter';


class SankeyDiagram implements MAppViews {

  private $node;
  private nodesToShow: number = 20;

  //Filters
  private pipeline: FilterPipeline;
  private entityEuroFilter: EntityEuroFilter;
  private mediaEuroFilter: MediaEuroFilter;
  private entitySearchFilter: EntitySearchFilter;
  private mediaSearchFilter: MediaSearchFilter;

  constructor(parent: Element, private options: any)
  {
    //Get FilterPipeline
    this.pipeline = FilterPipeline.getInstance();
    //Create Filters
    this.entityEuroFilter = new EntityEuroFilter();
    this.mediaEuroFilter = new MediaEuroFilter();
    this.entitySearchFilter = new EntitySearchFilter();
    this.mediaSearchFilter = new MediaSearchFilter();
    //Add Filters to pipeline
    this.pipeline.addFilter(this.entityEuroFilter);
    this.pipeline.addFilter(this.mediaEuroFilter);
    this.pipeline.changeEntitySearchFilter(this.entitySearchFilter);
    this.pipeline.changeMediaSearchFilter(this.mediaSearchFilter);

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
    let left = this.$node.append('div').attr('class', 'left_bars');
    let sankeyVis = this.$node.append('div').attr('class', 'sankey_vis');
    let middle = sankeyVis.append('div').attr('class', 'sankey_heading');
    let sankeyDiagram = sankeyVis.append('div').attr('id', 'sankeyDiagram');
    let right = this.$node.append('div').attr('class', 'right_bars');

    left.html(`
      <div class='left_bar_heading'><p>Public Entity</p></div>
      <label for='entitySearchFilter'>Search & Value Filter</label>
      <div class='input-group input-group-sm'>
        <input type='text' id='entitySearchFilter' class='form-control' placeholder='Search for...'/>
        <span class='input-group-btn'>
          <button type='button' id='entitySearchButton' class='btn btn-primary'><i class='fa fa-search'></i></button>
        </span>
      </div>
      <div class='input-group input-group-sm'>
        <input id='entityFilter'/>
      </div>
    `);

    middle.html(`
      <div><p>Flow</p></div>
    `);

    right.html(`
      <div class='right_bar_heading'><p>Media Institution</p></div>
      <label for='mediaSearchFilter'>Search & Value Filter</label>
      <div class='input-group input-group-sm'>
        <input type='text' id='mediaSearchFilter' class='form-control' placeholder='Search for...'/>
        <span class='input-group-btn'>
          <button type='button' id='mediaSearchButton' class='btn btn-primary'><i class='fa fa-search'></i></button>
      </div>
      <div class='input-group input-group-sm'>
        <input id='mediaFilter'/>
      </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    //This redraws if new data is available
    let dataAvailable = localStorage.getItem('dataLoaded') == 'loaded' ? true : false;
    if(dataAvailable) {
      this.getStorageData(false);
    }

    events.on(AppConstants.EVENT_DATA_PARSED, (evt, data) => {
      //Draw Sankey Diagram
      this.getStorageData(false);
    });

    events.on(AppConstants.EVENT_FILTER_CHANGED, (evt, data) => {
      this.$node.select('#sankeyDiagram').html('');
      //Redraw Sankey Diagram
      this.getStorageData(true);
    });


    this.$node.select('#entitySearchButton').on('click', (d) => {
      let value: string = $('#entitySearchFilter').val();
      this.entitySearchFilter.term = value;

      events.fire(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, d, null);
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    });

    this.$node.select('#mediaSearchButton').on('click', (d) => {
      let value: string = $('#mediaSearchFilter').val();
      this.mediaSearchFilter.term = value;

      events.fire(AppConstants.EVENT_FILTER_DEACTIVATE_TOP_FILTER, d, null);
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    });
  }

  /**
   * Just a handy method that can be called whenever the page is reloaded or when the data is ready.
   */
  private getStorageData(redraw: boolean)
  {
    localforage.getItem('data').then((value) => {
      //Store the unfiltered data too
      let originalData = value;

      //Filter the data before and then pass it to the draw function.
      let filteredData = this.pipeline.performFilters(value);

      this.pipeline.printFilters();

      if(!redraw)
      {
        this.setEntityFilterRange(originalData);
        this.setMediaFilterRange(originalData);
      }
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

    let headingOffset = 50;
    // let headingOffset = this.$node.select('.sankey_heading').node().getBoundingClientRect().height + 10;  //10 from padding of p tag
    let widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    let heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;

    const margin = { top: 10, right: 120, bottom: 10, left: 120 };
    const width =  widthNode  - margin.left - margin.right;
    const height = heightNode - margin.top - margin.bottom - headingOffset;
    const widthOffset = 80;

    //The '0' option enables zero-padding. The comma (',') option enables the use of a comma for a thousands separator.
    const formatNumber = d3.format(',.0f'),    // zero decimal places
      format = function(d) { return formatNumber(d) + ' ' + units; }; //Display number with unit sign

    //Append the svg canvas to the page
    const svg = d3.select('#sankeyDiagram').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform','translate(' + (margin.left + widthOffset/2) + ',' + margin.top + ')');

    //Set the diagram properties
    sankey.nodeWidth(35)
      .nodePadding(20)
      .size([width - widthOffset, height]);

    const path = sankey.link();

      // Group Data (by quartal)
    let nest =(<any>d3).nest()
        .key((d) => {return d.sourceNode;})
        .key(function (d) {return d.targetNode;})
        .rollup(function (v) {return {
          target: v[0].targetNode,
          source: v[0].sourceNode,
          time: v[0].timeNode,
          sum: d3.sum(v, function (d :any){ return d.valueNode;})
        }})
        .entries(json);

    let graph = {'nodes' : [], 'links' : []};
    that.nodesToShow = Math.ceil((heightNode / 25));    //Trying to make nodes length dependent on space in window
    console.log('changed', that.nodesToShow);

    let counter = 0;
    for(let d of nest) {
      counter += d.values.length;
      if(counter >= 26) break;
      for (var v = 0; v <= d.values.length - 1; v++) {
        graph.nodes.push({ 'name': d.key });//all Nodes source
        graph.nodes.push({ 'name': d.values[v].key });//all Nodes target
        graph.links.push({ 'source': d.key,
          'target': d.values[v].key,
          'value': +d.values[v].values.sum,
          'time': d.values[v].values.time});
      }
    }

    //d3.keys - returns array of keys from the nest function
    //d3.nest - groups the values of an array by the given key
    //d3.map - constructs a new map and copies all enumerable properties from the specified object into this map.
    graph.nodes = (<any>d3).keys((<any>d3).nest()
      .key((d) => {return d.name;})
      .map(graph.nodes));

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
      .layout(10); //Difference only by 0, 1 and otherwise always the same

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
      .text(function(d) { return d.source.name + ' → ' +  d.target.name + '\n' + format(d.value); });

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
      .text(function(d) { return d.name + '\n' + format(d.value); });

    // //This is how the overlays for the rects can be done after they have been added
    // node.append('rect')
    //   .attr('height', function(d) {
    //     console.log(d.name, d.dy);
    //     return 10;
    //   })
    //   .attr('width', sankey.nodeWidth())
    //   .style('fill', '#FAB847');

    //Add in the title for the nodes
    let heading = node.append('g').append('text')
      .attr('x', 45)
      .attr('y', function(d) { return (d.dy / 2) - 10;})
      .attr('dy', '1.0em')
      .attr('text-anchor', 'start')
      .attr('class', 'rightText')
      .text(function(d) {return `${d.name}`;})
      .filter(function(d, i) { return d.x < width / 2})
      .attr('x', -45 + sankey.nodeWidth())
      .attr('text-anchor', 'end')
      .attr('class', 'leftText');

    //The strange word wrapping. Resizes based on the svg size the sankey diagram size and the words and text size.
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

  /**
   * This method sets the range for the entity value filter according to the priovided data.
   * @param data where the filter gets the range from.
   */
  private setEntityFilterRange(data: any): void
  {
    this.entityEuroFilter.calculateMinMaxValues(data);
    let min: number = this.entityEuroFilter.minValue;
    let max: number = this.entityEuroFilter.maxValue;

    $('#entityFilter').bootstrapSlider({
      min: Number(min),
      max: Number(max),
      range: true,
      tooltip_split: true,
      tooltip_position: 'bottom',
      value: [Number(min), Number(max)],
    }).on('slideStop', (d) => {
      let newMin: number = d.value[0];     //First value is left slider handle;
      let newMax: number = d.value[1];     //Second value is right slider handle;
      this.entityEuroFilter.minValue = newMin;
      this.entityEuroFilter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, data);
    });
  }

  private setMediaFilterRange(originalData: any): void
  {
    this.mediaEuroFilter.calculateMinMaxValues(originalData);
    let min: number = this.mediaEuroFilter.minValue;
    let max: number = this.mediaEuroFilter.maxValue;

    $('#mediaFilter').bootstrapSlider({
      min: Number(min),
      max: Number(max),
      range: true,
      tooltip_split: true,
      tooltip_position: 'bottom',
      value: [Number(min), Number(max)],
    }).on('slideStop', (d) => {
      let newMin: number = d.value[0];     //First value is left slider handle;
      let newMax: number = d.value[1];     //Second value is right slider handle;
      this.mediaEuroFilter.minValue = newMin;
      this.mediaEuroFilter.maxValue = newMax;
      events.fire(AppConstants.EVENT_FILTER_CHANGED, originalData);
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
