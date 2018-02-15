/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import 'ion-rangeslider';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.css';
import 'style-loader!css-loader!ion-rangeslider/css/ion.rangeSlider.skinNice.css';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {AppConstants} from './app_constants';
import {MAppViews} from './app';
import {roundToFull, dotFormat, textTransition, d3TextEllipse, Tooltip} from './utilities';
import {
  setEntityFilterRange, updateEntityRange, setMediaFilterRange,
  updateMediaRange, setEuroFilterRange, updateEuroRange,
  getEntityRef, getMediaRef, getValueRef
} from './filters/filterMethods';
import {ERROR_TOOMANYNODES, ERROR_TOOMANYFILTER} from './language';
import FilterPipeline from './filters/filterpipeline';
import EntityEuroFilter from './filters/entityEuroFilter';
import MediaEuroFilter from './filters/mediaEuroFilter';
import EntitySearchFilter from './filters/entitySearchFilter';
import MediaSearchFilter from './filters/mediaSearchFilter';
import PaymentEuroFilter from './filters/paymentEuroFilter';
import SparklineBarChart from './sparklineBarChart';
import TimeFormat from './timeFormat';
import SimpleLogging from './simpleLogging';


class SankeyDiagram implements MAppViews {

  private $node;
  private nodesToShow: number = 25;
  private sankeyHeight: number = 0;
  private maximumNodes: number = 0;
  private drawReally: boolean = true;
  private valuesSumSource : {key: string, values: number}[];
  private valuesSumTarget : {key: string, values: number}[];
  private minFraction: number = 1;

  //Filters
  private pipeline: FilterPipeline;
  private entityEuroFilter: EntityEuroFilter;
  private mediaEuroFilter: MediaEuroFilter;
  private entitySearchFilter: EntitySearchFilter;
  private mediaSearchFilter: MediaSearchFilter;
  private euroFilter: PaymentEuroFilter;

  //Sliders
  private entitySlider; private entityFrom = 0; private entityTo = 0;
  private mediaSlider; private mediaFrom = 0; private mediaTo = 0;
  private valueSlider; private euroFrom = 0; private euroTo = 0;

  private activeQuarters: string[] = [];

  constructor(parent: Element, private options: any) {
    // Get FilterPipeline
    this.pipeline = FilterPipeline.getInstance();
    // Create Filters
    this.entityEuroFilter = new EntityEuroFilter();
    this.mediaEuroFilter = new MediaEuroFilter();
    this.euroFilter = new PaymentEuroFilter();
    this.entitySearchFilter = new EntitySearchFilter();
    this.mediaSearchFilter = new MediaSearchFilter();
    // Add Filters to pipeline
    this.pipeline.addFilter(this.entityEuroFilter);
    this.pipeline.addFilter(this.mediaEuroFilter);
    this.pipeline.addFilter(this.euroFilter);
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
    this.attachElemListeners();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    const left = this.$node.append('div').attr('class', 'left_bars');
    const sankeyVis = this.$node.append('div').attr('class', 'sankey_vis');
    const middle = sankeyVis.append('div').attr('class', 'middle_bars');
    const sankeyDiagram = sankeyVis.append('div').attr('id', 'sankeyDiagram');
    const loadMore = sankeyVis.append('div').attr('class', 'load_more');
    const right = this.$node.append('div').attr('class', 'right_bars');

    // Check if column meta data is in storage and provide some defaults
    let columnLabels: any = JSON.parse(localStorage.getItem('columnLabels'));
    if (columnLabels == null) {
      columnLabels = {};
      columnLabels.sourceNode = 'Source';
      columnLabels.targetNode = 'Target';
      columnLabels.valueNode = '';
    } else {
      TimeFormat.setFormat(columnLabels.timeNode);
    }

    left.html(`
    <div class='controlBox'>
        <div class='left_bar_heading'><p>Source: ${columnLabels.sourceNode}</p></div>
          <div class='row'>
            <div class='col-sm-10'>
              <input id='entityFilter'/>
            </div>
            <div class='col-sm-1' style='margin-top: 24px;'>
              <a data-toggle='collapse' href='#collapseContentEntity' aria-expanded='true' class='collapsed'>
              <i class='fa fa-pencil-square-o pull-right specialIcon'></i></a>
            </div>
          </div>
          <div id='collapseContentEntity' class='collapse'>
              <div class='input-group input-group-xs'>
                <span class='input-group-addon'>Min:</span>
                <input type='number' value='${this.entityFrom}' class='sliderInput' id='entityFrom' />
                <span class='input-group-addon'>Max:</span>
                <input type='number' value='${this.entityTo}' class='sliderInput' id='entityTo' />
              </div>
          </div>

        <div class='input-group input-group-xs'>
          <input type='text' id='entitySearchFilter' class='form-control' placeholder='Search for ${columnLabels.sourceNode}...'/>
          <span class='input-group-btn'>
            <button type='button' id='entitySearchButton' class='btn btn-primary'><i class='fa fa-search'></i></button>
          </span>
          <span class='input-group-btn'>
            <button type='button' id='clearEntity' class='btn btn-secondary'><i class='fa fa-times'></i></button>
          </span>
        </div>
      </div>
    `);

    middle.html(`
    <div class='controlBox'>
      <div class='sankey_heading'><p id='sankeyHeadingMiddle'>Flow</p><p id='infoNodesLeft'></p></div>
        <div class='row' style='width: 50%; margin: auto;'>
          <div class='col-sm-11'>
            <input id='valueSlider'/>
          </div>
          <div class='col-sm-1' style='margin-top: 24px;'>
            <a data-toggle='collapse' href='#collapseContentEntity3' aria-expanded='true' class='collapsed'>
            <i class='fa fa-pencil-square-o pull-right specialIcon'></i></a>
          </div>
        </div>
        <div id='collapseContentEntity3' class='collapse' style='width: 67%; margin-left: 21%;'>
            <div class='input-group input-group-xs'>
              <span class='input-group-addon'>Min:</span>
              <input type='number' value='${this.euroFrom}' class='sliderInput' id='euroFrom' />
              <span class='input-group-addon'>Max:</span>
              <input type='number' value='${this.euroTo}' class='sliderInput' id='euroTo' />
            </div>
        </div>
    </div>
    `);

    loadMore.html(`
      <span id='loadInfo' style='text-align: center;'>X/Y elements displayed</span>
      <div class='input-group input-group-xs'>
        <span class='input-group-btn'>
          <button id='loadLessBtn' type='button' class='btn btn-secondary ' disabled='true'>
          <span>Show Less</span></button>
        </span>
        <span class='input-group-btn'>
          <button id='loadMoreBtn' type='button' class='btn btn-secondary '>
          <span class='btnText'>Show More</span></button>
        </span>
      </div>
    `);

    right.html(`
    <div class='controlBox'>
      <div class='right_bar_heading'><p>Target: ${columnLabels.targetNode}</p></div>
      <div class='row'>
        <div class='col-sm-10'>
          <input id='mediaFilter'/>
        </div>
        <div class='col-sm-1' style='margin-top: 24px;'>
          <a data-toggle='collapse' href='#collapseContentEntity2' aria-expanded='true' class='collapsed'>
          <i class='fa fa-pencil-square-o pull-right specialIcon'></i></a>
        </div>
      </div>
      <div id='collapseContentEntity2' class='collapse'>
          <div class='input-group input-group-xs'>
            <span class='input-group-addon'>Min:</span>
            <input type='number' value='${this.mediaFrom}' class='sliderInput' id='mediaFrom' />
            <span class='input-group-addon'>Max:</span>
            <input type='number' value='${this.mediaTo}' class='sliderInput' id='mediaTo' />
          </div>
      </div>

      <div class='input-group input-group-xs'>
        <input type='text' id='mediaSearchFilter' class='form-control' placeholder='Search for ${columnLabels.targetNode}...'/>
        <span class='input-group-btn'>
          <button type='button' id='mediaSearchButton' class='btn btn-primary'><i class='fa fa-search'></i></button>
        </span>
        <span class='input-group-btn'>
          <button type='button' id='clearMedia' class='btn btn-secondary'><i class='fa fa-times'></i></button>
        </span>
      </div>
    </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // This redraws if new data is available
    const dataAvailable = localStorage.getItem('dataLoaded') === 'loaded' ? true : false;
    if (dataAvailable) {
      this.getStorageData(false);
    }

    // Listen to newly arrived data
    events.on(AppConstants.EVENT_DATA_PARSED, (evt, data) => {
      setTimeout(function () {
        location.reload();
      }, 500);

      // Draw Sankey Diagram
      this.getStorageData(false);
    });

    // Listen for changed data and redraw all
    events.on(AppConstants.EVENT_FILTER_CHANGED, (evt, data) => {
      this.$node.select('#sankeyDiagram').html('');
      // Redraw Sankey Diagram
      this.getStorageData(true);
      // Update the input fields
      this.updateInputValues('#entityFrom', '#entityTo', this.entityEuroFilter.minValue, this.entityEuroFilter.maxValue);
      this.updateInputValues('#mediaFrom', '#mediaTo', this.mediaEuroFilter.minValue, this.mediaEuroFilter.maxValue);
      this.updateInputValues('#euroFrom', '#euroTo', this.euroFilter.minValue, this.euroFilter.maxValue);
    });

    // Listen for resize of the window
    events.on(AppConstants.EVENT_RESIZE_WINDOW, () => {
      SimpleLogging.log('resize window', '');
      this.resize();
    });

    // Listen for the change of the quarter slider and update others
    events.on(AppConstants.EVENT_SLIDER_CHANGE, (e, d) => {
      updateEntityRange(this.entityEuroFilter, d);
      updateMediaRange(this.mediaEuroFilter, d);
      updateEuroRange(this.euroFilter, d);
      this.updateInputValues('#entityFrom', '#entityTo', this.entityEuroFilter.minValue, this.entityEuroFilter.maxValue);
      this.updateInputValues('#mediaFrom', '#mediaTo', this.mediaEuroFilter.minValue, this.mediaEuroFilter.maxValue);
      this.updateInputValues('#euroFrom', '#euroTo', this.euroFilter.minValue, this.euroFilter.maxValue);
    });

    // Clear the search fields too
    events.on(AppConstants.EVENT_CLEAR_FILTERS, (evt, data) => {
      $('#entitySearchFilter').val('');
      this.entitySearchFilter.term = '';
      $('#mediaSearchFilter').val('');
      this.mediaSearchFilter.term = '';
    });
  }

  /**
   * This method gets called whenever the page is resized.
   */
  private resize() {
    d3.select('#sankeyDiagram').html('');
    this.getStorageData(true);
  }

  /**
   * Just a handy method that can be called whenever the page is reloaded or when the data is ready.
   */
  private getStorageData(redraw: boolean) {
    localforage.getItem('data').then((value) => {
      // Store the unfiltered data too
      const originalData = value;
      if (!redraw) {
        setEntityFilterRange(this.entityEuroFilter, '#entityFilter', originalData);
        setMediaFilterRange(this.mediaEuroFilter, '#mediaFilter', originalData);
        setEuroFilterRange(this.euroFilter, '#valueSlider', originalData);

        events.fire(AppConstants.EVENT_UI_COMPLETE, originalData);

        // Initialize Slider Inputs and update them with the right values
        this.entityFrom = this.entityEuroFilter.minValue;
        this.entityTo = this.entityEuroFilter.maxValue;
        this.updateInputValues('#entityFrom', '#entityTo', this.entityFrom, this.entityTo);
        this.mediaFrom = this.mediaEuroFilter.minValue;
        this.mediaTo = this.mediaEuroFilter.maxValue;
        this.updateInputValues('#mediaFrom', '#mediaTo', this.mediaFrom, this.mediaTo);
        this.euroFrom = this.euroFilter.minValue;
        this.euroTo = this.euroFilter.maxValue;
        this.updateInputValues('#euroFrom', '#euroTo', this.euroFrom, this.euroTo);

        SimpleLogging.log('initialize sankey', JSON.parse(localStorage.getItem('columnLabels')));
      }

      // Filter the data before and then pass it to the draw function.
      const filteredData = this.pipeline.performFilters(value);
      this.valuesSumSource = d3.nest()
        .key((d: any) => { return d.sourceNode; })
        .rollup(function (v) { return d3.sum(v, function (d: any) { return d.valueNode; }); })
        .entries(filteredData);

      this.valuesSumTarget = d3.nest()
        .key((d: any) => { return d.targetNode; })
        .rollup(function (v) { return d3.sum(v, function (d: any) { return d.valueNode; }); })
        .entries(filteredData);

      // console.log('----------- Original Data -----------');
      console.log(originalData);
      // console.log('----------- Filtered Data -----------');
      // console.log(filteredData);
      this.pipeline.printFilters();
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
    const timePoints: any = d3.set(json.map(function (d: any) {return d.timeNode;})).values().sort();
    const selectedTimePointsAsString = (timePoints.length > 1)
      ? TimeFormat.format(timePoints[0]) + ' \u2013 ' + TimeFormat.format(timePoints[timePoints.length - 1])
      : TimeFormat.format(timePoints[0]);
    const columnLabels: any = JSON.parse(localStorage.getItem('columnLabels'));
    /** unit of flows (e.g., '€'). Extracted from CSV header. */
    const valuePostFix = (columnLabels == null) ? '' : ' ' + columnLabels.valueNode;

    const headingOffset = this.$node.select('.controlBox').node().getBoundingClientRect().height;  //10 from padding of p tag
    const footerOffset = this.$node.select('.load_more').node().getBoundingClientRect().height + 15;
    const widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    const heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;

    const margin = {top: 10, right: 120, bottom: 10, left: 120};
    const width = widthNode - margin.left - margin.right;
    const height = heightNode - margin.top - margin.bottom - headingOffset - footerOffset;
    const widthOffset = 80;

    // Append the svg canvas to the page
    const svg = d3.select('#sankeyDiagram').append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + (margin.left + widthOffset / 2) + ',' + margin.top + ')');

    // Set the diagram properties
    sankey.nodeWidth(35)
      .nodePadding(20)
      .size([width - widthOffset, height]);

    const path = sankey.link();

    // Aggregate flow by source and target (i.e. sum multiple times and attributes)
    const flatNest = d3.nest()
      .key((d: any) => {
        return d.sourceNode + '|$|' + d.targetNode; // First define keys
      })
      .rollup(function (v: any[]) { // construct object
        return {
          source: v[0].sourceNode,
          target: v[0].targetNode,
          time: v[0].timeNode,
          sum: d3.sum(v, function (d: any) {
            return d.valueNode;
          })
        };
      })
      .entries(json)
      .map((o) => o.values) // Remove key/values
      .sort(function (a: any, b: any) { // Sort the array of objects by sum
        return d3.descending(a.sum, b.sum);
      })
      .filter((e) => {return e.sum > 0;}); // Remove entries whos sum is smaller than 0

    // Create reduced graph with only number of nodes shown
    const graph = {'nodes': [], 'links': []};
    console.log('changed', that.nodesToShow);
    // Keep track of number of flows (distinct source target pairs)
    that.maximumNodes = flatNest.length;

    //============ CHECK IF SHOULD DRAW ============
    if (json.length === 0 || flatNest.length === 0) {                     //ERROR: Too strong filtered
      that.drawReally = false;
      this.showErrorDialog(ERROR_TOOMANYFILTER);
    } else {
      that.drawReally = true;
    }

    //============ REALLY DRAW ===============
    if (that.drawReally) {
      let counter = 0;
      for (const d of flatNest) {
        counter++;
        if (counter * 2 > that.nodesToShow) {
          const textUp = `Flows below ${dotFormat(d.sum)}${valuePostFix} are not displayed.`;
          textTransition(d3.select('#infoNodesLeft'), textUp, 350);
          const textDown = `${counter}/${this.valuesSumSource.length + this.valuesSumTarget.length} elements displayed`;
          textTransition(d3.select('#loadInfo'), textDown, 350);
          break;
        }
        graph.nodes.push({'name': d.source});//all Nodes source
        graph.nodes.push({'name': d.target});//all Nodes target
        graph.links.push({
          'source': d.source,
          'target': d.target,
          'value': d.sum
        });
      }

      // d3.keys - returns array of keys from the nest function
      // d3.nest - groups the values of an array by the given key
      // d3.map - constructs a new map and copies all enumerable properties from the specified object into this map.
      graph.nodes = (<any>d3).keys((<any>d3).nest().key((d) => {return d.name;}).map(graph.nodes));

      graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
      });

      // This makes out of the array of strings a array of objects with the key 'name'
      graph.nodes.forEach((d, i) => {
        // Also store the overall sum of (filtered) flows for the node
        let overall = 0;
        let visible = -1;
        for (const val of this.valuesSumSource) {
          if (val.key === d) {
            overall = val.values;

            visible = graph.links
              .filter((d) => { return d.source === i; })
              .map((d) => d.value)
              .reduce((total, current) => total + current);
            }
        }
        for (const val of this.valuesSumTarget) {
          if (val.key === d) {
            overall = val.values;

            visible = graph.links
              .filter((d) => { return d.target === i; })
              .map((d) => d.value)
              .reduce((total, current) => total + current);
          }
        }

        graph.nodes[i] = {'name': d, 'overall': overall, 'fraction': visible/overall};
      });

      this.minFraction = Math.min(...graph.nodes.map((d) => d.fraction));

      // Basic parameters for the diagram
      sankey
        .nodes(graph.nodes)
        //.links(linksorted)
        .links(graph.links)
        .layout(10); //Difference only by 0, 1 and otherwise always the same

      svg.append('defs')  // Cretae a reusable pattern defs are basically templates that are not immediately rendered.
        .append('pattern')
        .attr('id', 'diagonalHatch')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('width', 4)
        .attr('height', 4)
        .append('path')
        .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1);

      const link = svg.append('g').selectAll('.link')
        .data(graph.links)
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', path)
        .style('stroke-width', function (d) {
          return Math.max(1, d.dy);
        })
        // Reduce edges crossing
        .sort(function (a, b) {
          return b.dy - a.dy;
        })
        .on('mouseover', function (d) {
          d3.select(this).style('cursor', 'pointer');
          const text = d.source.name + ' → ' + d.target.name + '\n' + dotFormat(d.value) + valuePostFix;
          Tooltip.mouseOver(d, text, 'T2');
        })
        .on('mouseout', Tooltip.mouseOut);

      // Add the on 'click' listener for the links
      link.on('click', function (d) {
        const coordinates = d3.mouse(svg.node());
        events.fire(AppConstants.EVENT_CLICKED_PATH, d, origJson, coordinates);
      });

      // Add in the nodes
      const node = svg.append('g').selectAll('.node')
        .data(graph.nodes)
        .enter().append('g')
        .attr('class', function (d: any, i: number) {
          // Save type of node in DOM
          if (d.sourceLinks.length > 0) {
            return 'node source';
          } else {
            return 'node target';
          }
        })
        .attr('transform', function (d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });

      // Add the rectangles for the nodes
      node.append('rect')
        .attr('height', (d) => { return d.dy; })
        .attr('width', (d) => {
          return Math.max(this.minFraction * sankey.nodeWidth()  / d.fraction, 1);
        })
        .attr('x', (d) => {
          if (d.sourceLinks.length <= 0) {
            return 0;
          } else {
            return sankey.nodeWidth() - Math.max(this.minFraction * sankey.nodeWidth() / d.fraction, 1);
          }
        })
        .style('fill', '#DA5A6B')
        .on('mouseover', (d) => {
          this.assembleNodeTooltip(d, valuePostFix);
        })
        .on('mouseout', Tooltip.mouseOut);

      // Create sparkline barcharts for newly enter-ing g.node elements
      node.call(SparklineBarChart.createSparklines);

      // This is how the overlays for the rects can be done after they have been added
      node.append('rect')
        .filter((d) => {return d.overall > d.value; })
          .attr('width', (d) =>  {
            return Math.max(this.minFraction * sankey.nodeWidth() * (d.overall / d.value - 1), 1);
          })
          .attr('height', (d) => { return d.dy; })
          .style('fill', 'url(#diagonalHatch)')
          .attr('x', (d) => {
            if (d.sourceLinks.length <= 0) {
              return this.minFraction * sankey.nodeWidth();
            } else {
              return sankey.nodeWidth() - Math.max(this.minFraction * sankey.nodeWidth() * d.overall / d.value, 1);
            }
          })
          .on('mouseout', Tooltip.mouseOut)
          .on('mouseover', (d) => {
            this.assembleNodeTooltip(d, valuePostFix);
          });

      // Add in the title for the nodes
      const heading = node.append('g').append('text')
        .attr('x', 45)
        .attr('y', function (d) {
          return (d.dy / 2) - 10;
        })
        .attr('dy', '1.0em')
        .attr('text-anchor', 'start')
        .attr('class', 'rightText')
        .text(function (d) {
          return `${d.name}`;
        })
        .filter(function (d, i) {
          return d.x < width / 2;
        })
        .attr('x', -45 + sankey.nodeWidth())
        .attr('text-anchor', 'end')
        .attr('class', 'leftText');

      // Here the textwrapping happens of the nodes
      const maxTextWidth = (margin.left + margin.right - 10) / 2;
      const leftWrap = this.$node.selectAll('.leftText');
      d3TextEllipse(leftWrap, maxTextWidth);
      const rightWrap = this.$node.selectAll('.rightText');
      d3TextEllipse(rightWrap, maxTextWidth);

      // On Hover titles for Sankey Diagram Text - after Text Elipsis
      heading.on('mouseover', (d) => {
        this.assembleNodeTooltip(d, valuePostFix);
      })
        .on('mouseout', Tooltip.mouseOut);
      rightWrap.on('mouseover', (d) => {
        this.assembleNodeTooltip(d, valuePostFix);
      })
        .on('mouseout', Tooltip.mouseOut);

    } else {
      const svgPlain = d3.select('#sankeyDiagram svg');
      svgPlain.append('text').attr('transform', 'translate(' + (width + margin.left + margin.right) / 2 + ')')
        .attr('y', (height + margin.top + margin.bottom) / 2)
        .append('tspan').attr('x', '0').attr('text-anchor', 'middle').style('font-size', '2em')
        .style('font-varaint', 'small-caps')
        .text('Nothing to show!');
    }
  }

  /**
   * This method contains all element listeners, that are called throughout the whole applicaiton. They can be
   * triggered several times, but need to be registered only once.
   */
  private attachElemListeners() {
    // Full-text search in source node names
    const sourceSearch = (d) => {
      const value: string = $('#entitySearchFilter').val();
      this.entitySearchFilter.term = value;

      SimpleLogging.log('source name filter', value);
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    };
    $('#entitySearchFilter').keypress((e) => {
      if (e.which === 13) {
        sourceSearch(e);
      }
    });
    this.$node.select('#entitySearchButton').on('click', sourceSearch);

    this.$node.select('#clearEntity').on('click', (d) => {
      $('#entitySearchFilter').val('');
      this.entitySearchFilter.term = '';
      SimpleLogging.log('source name filter cleared', '');
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    });

    // Full-text search in target node names
    const targetSearch = (d) => {
      const value: string = $('#mediaSearchFilter').val();
      this.mediaSearchFilter.term = value;

      SimpleLogging.log('target name filter', value);
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    };
    $('#mediaSearchFilter').keypress((e) => {
      if (e.which === 13) {
        targetSearch(e);
      }
    });
    this.$node.select('#mediaSearchButton').on('click', targetSearch);

    this.$node.select('#clearMedia').on('click', (d) => {
      $('#mediaSearchFilter').val('');
      this.mediaSearchFilter.term = '';
      SimpleLogging.log('target name filter cleared', '');
      events.fire(AppConstants.EVENT_FILTER_CHANGED, d, null);
    });

    // Functionality of show more button with dynamic increase of values.
    this.$node.select('#loadMoreBtn').on('click', (e) => {
      this.nodesToShow += 25;
      SimpleLogging.log('show more flows', this.nodesToShow);
      if (this.nodesToShow > 25) {
        d3.select('#loadLessBtn').attr('disabled', null);
      }
      if (this.nodesToShow > this.maximumNodes) {
        this.nodesToShow = this.maximumNodes;
      }

      // Increase the height of the svg to fit the data
      this.sankeyHeight = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;
      this.sankeyHeight += (10 * this.nodesToShow);
      this.$node.select('.sankey_vis').style('height', this.sankeyHeight + 'px');

      d3.select('#sankeyDiagram').html('');
      d3.selectAll('.barchart').html('');
      // This is necessary in order to increase the height of the barchart svgs
      const headingOffset = this.$node.select('.controlBox').node().getBoundingClientRect().height;
      const footerOffset = this.$node.select('.load_more').node().getBoundingClientRect().height + 15;
      d3.selectAll('.barchart').attr('height', this.sankeyHeight - headingOffset - footerOffset + 'px');
      this.getStorageData(true);

      const evt = <MouseEvent>d3.event;
      evt.preventDefault();
      evt.stopPropagation();
    });

    // Functionality of show less button with dynamic increase of values.
    this.$node.select('#loadLessBtn').on('click', (e) => {
      this.sankeyHeight = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;
      this.sankeyHeight -= (10 * this.nodesToShow);
      this.$node.select('.sankey_vis').style('height', this.sankeyHeight + 'px');

      this.nodesToShow -= 25;
      SimpleLogging.log('show less flows', this.nodesToShow);
      if (this.nodesToShow <= 25) {
        d3.select('#loadLessBtn').attr('disabled', true);
        this.nodesToShow = 25;
      }

      d3.select('#sankeyDiagram').html('');
      d3.selectAll('.barchart').html('');
      this.getStorageData(true);
      // This is necessary in order to reduce the height of the barchart svgs
      const headingOffset = this.$node.select('.controlBox').node().getBoundingClientRect().height;
      const footerOffset = this.$node.select('.load_more').node().getBoundingClientRect().height + 15;
      d3.selectAll('.barchart').attr('height', this.sankeyHeight - headingOffset - footerOffset + 'px');

      const evt = <MouseEvent>d3.event;
      evt.preventDefault();
      evt.stopPropagation();
    });

    // Change detection for the input FROM of the ENTITY slider.
    $('#entityFrom').on('change', () => {
      this.entityFrom = +$('#entityFrom').prop('value');
      if (this.entityFrom < this.entityEuroFilter.minValue) {
        this.entityFrom = this.entityEuroFilter.minValue;
      }
      if (this.entityFrom > this.entityTo) {
        this.entityFrom = this.entityTo;
      }
      this.updateInputValues('#entityFrom', '#entityTo', this.entityFrom, this.entityTo);
      this.updateSliderRange(getEntityRef(), this.entityFrom, this.entityTo);
    });

    // Change detection for the input TO of the ENTITY slider
    $('#entityTo').on('change', () => {
      this.entityTo = +$('#entityTo').prop('value');
      if (this.entityTo > this.entityEuroFilter.maxValue) {
        this.entityTo = this.entityEuroFilter.maxValue;
      }
      if (this.entityTo < this.entityFrom) {
        this.entityTo = this.entityFrom;
      }
      this.updateInputValues('#entityFrom', '#entityTo', this.entityFrom, this.entityTo);
      this.updateSliderRange(getEntityRef(), this.entityFrom, this.entityTo);
    });

    // Change detection for the input FROM of the MEDIA slider.
    $('#mediaFrom').on('change', () => {
      this.mediaFrom = +$('#mediaFrom').prop('value');
      if (this.mediaFrom < this.mediaEuroFilter.minValue) {
        this.mediaFrom = this.mediaEuroFilter.minValue;
      }
      if (this.mediaFrom > this.mediaTo) {
        this.mediaFrom = this.mediaTo;
      }
      this.updateInputValues('#mediaFrom', '#mediaTo', this.mediaFrom, this.mediaTo);
      this.updateSliderRange(getMediaRef(), this.mediaFrom, this.mediaTo);
    });

    // Change detection for the input TO of the MEDIA slider
    $('#mediaTo').on('change', () => {
      this.mediaTo = +$('#mediaTo').prop('value');
      if (this.mediaTo > this.mediaEuroFilter.maxValue) {
        this.mediaTo = this.mediaEuroFilter.maxValue;
      }
      if (this.mediaTo < this.mediaFrom) {
        this.mediaTo = this.mediaFrom;
      }
      this.updateInputValues('#mediaFrom', '#mediaTo', this.mediaFrom, this.mediaTo);
      this.updateSliderRange(getMediaRef(), this.mediaFrom, this.mediaTo);
    });

    // Change detection for the input FROM of the EURO slider.
    $('#euroFrom').on('change', () => {
      this.euroFrom = +$('#euroFrom').prop('value');
      if (this.euroFrom < this.euroFilter.minValue) {
        this.euroFrom = this.euroFilter.minValue;
      }
      if (this.euroFrom > this.euroTo) {
        this.euroFrom = this.euroTo;
      }
      this.updateInputValues('#euroFrom', '#euroTo', this.euroFrom, this.euroTo);
      this.updateSliderRange(getValueRef(), this.euroFrom, this.euroTo);
    });

    // Change detection for the input TO of the EURO slider
    $('#euroTo').on('change', () => {
      this.euroTo = +$('#euroTo').prop('value');
      if (this.euroTo > this.euroFilter.maxValue) {
        this.euroTo = this.euroFilter.maxValue;
      }
      if (this.euroTo < this.euroFrom) {
        this.euroTo = this.euroFrom;
      }
      this.updateInputValues('#euroFrom', '#euroTo', this.euroFrom, this.euroTo);
      this.updateSliderRange(getValueRef(), this.euroFrom, this.euroTo);
    });
  }

  /**
   * This method updates the input values of each slider present.
   * @param fromElem input element with the 'From'
   * @param toElem input element with the 'To'
   * @param from value of 'From'
   * @param to value of 'To'
   */
  private updateInputValues(fromElem: string, toElem: string, from: number, to: number): void {
    $(fromElem).prop('value', from);
    $(toElem).prop('value', to);
  }

  /**
   * This method updates the slider Ranges with the input fields.
   * @param sliderRef is a reference to the current slider object
   * @param from value of 'From'
   * @param to value of 'To'
   */
  private updateSliderRange(sliderRef, fromNumber: number, toNumber: number): void {
    sliderRef.update({
      from: fromNumber,
      to: toNumber
    });
  }

  /**
   * Displays a tooltip about a node.
   * @param d data of a node as received from D3
   * @param valuePostFix either "to" or "from"
   */
  private assembleNodeTooltip(d: any, valuePostFix: string) {
    const direction = (d.sourceLinks.length <= 0) ? 'from' : 'to';
    // Table because of aligned decimal numbers
    const text = `${d.name}
    <br />
    <table class='node'>
      <tr><td>
        <svg width='8' height='8'>
          <rect width='8' height='8' fill='#DA5A6B' />
        </svg>
        ${dotFormat(d.value) + valuePostFix}
      </td><td> ${direction} displayed elements.</td></tr>
    `;

    const hiddenFlows = (d.overall - d.value) > 0 ? `
    <tr><td>
      <svg width='8' height='8'>
        <defs>
          <pattern id='diagonalHatch2' patternUnits='userSpaceOnUse' width='4' height='4'>
            <rect width='4' height='4' fill='#DA5A6B' />
            <path d='M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2' stroke='#ffffff' 'stroke-width='1' />
          </pattern>
        </defs>
      <rect width='8' height='8' fill='url(#diagonalHatch2)' />
      </svg>
    ${dotFormat((d.overall - d.value)) + valuePostFix}</td><td>are not displayed.</td></tr>
    ` : '';

    Tooltip.mouseOver(d, text + hiddenFlows + '</table>', 'T2');
  }

  /**
   * This method is used in order to display error messages for the user.
   * @param text which shall be shown in the dialog
   */
  private showErrorDialog(text: string): void {
    bootbox.confirm({
      className: 'dialogBox',
      title: 'Information',
      message: text,
      callback(result) {
        if (result) {
          console.log('Ok pressed...');
        } else {
          return;
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
