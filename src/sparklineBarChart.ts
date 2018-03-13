/**
 * Created by rind on 5/30/17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import {AppConstants} from './app_constants';
import {MAppViews} from './app';
import {dotFormat, d3TextWrap} from './utilities';
import FilterPipeline from './filters/filterpipeline';
import TimeFormat from './timeFormat';

const CHART_HEIGHT: number = 18;
const INITIAL_SVG_HEIGHT: number = 100;
const OFFSET = 20;                         // Offset for the chart in px

interface IKeyValue {
  key: string;
  values: number;
}

export default class SparklineBarChart implements MAppViews {
  // 2 singletons for both views
  private static sourceChart: SparklineBarChart;
  private static targetChart: SparklineBarChart;

  private $node;
  private parentDOM: string;
  private field: string;
  private necessaryHeight = INITIAL_SVG_HEIGHT;
  private chartWidth: number = 120;        // Fallback if not calcualted dynamically

  /** unit of flows (e.g., '€'). Extracted from CSV header. */
  private valuePostFix = '';

  private activeQuarters: string[] = [];

  constructor(parent: Element, private options: any) {
    this.field = options.field;
    this.parentDOM = options.parentDOM;

    // Initialize Singletons aka the Objects for left or right view point
    if ('sourceNode' === options.field) {
      SparklineBarChart.sourceChart = this;
      this.chartWidth = (d3.select('.left_bars') as any).node().getBoundingClientRect().width - OFFSET;
    } else if ('targetNode' === options.field) {
      SparklineBarChart.targetChart = this;
      this.chartWidth = (d3.select('.right_bars') as any).node().getBoundingClientRect().width - OFFSET;
    }
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<ValidHeader>}
   */
  init() {
    this.attachListener();

    const dataAvailable = localStorage.getItem('dataLoaded') === 'loaded' ? true : false;
    if(dataAvailable) {
      // Prepare the svg here, apparently sankey.init() has already finished
      this.$node = d3.select(this.parentDOM)
        .append('svg')
        .classed('barchart', true)
        .attr('width', this.chartWidth)
        .attr('height', INITIAL_SVG_HEIGHT);
    }

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * build sparkline barcharts for enter selection of sankey nodes.
   * This function can be passed to the call method of a d3 selection.
   * @param node
   */
  public static createSparklines(node: d3.Selection<any>) {
    // This is how we retrieve the data. As it's loaded async it is only available as promise.
    // We can save the promise thoug in a global variable and get the data later if we need
    const promiseData = localforage.getItem('data').then((value) => {
      return value;
    });

    // Within the {} the data is available for usage
    promiseData.then(function (data: any) {
      const timePoints = d3.set(
        data.map(function (d: any) { return d.timeNode; })
      ).values().sort();

      const attFiltData = FilterPipeline.getInstance().performAttributeFilters(data);

      node.each(function (d, i) {
        const nodeElem = d3.select(this);

        if (nodeElem.attr('class').includes('source')) {
          SparklineBarChart.sourceChart.build(attFiltData, nodeElem.datum().name, nodeElem.datum().y, nodeElem.datum().dy, timePoints);
        } else {
          SparklineBarChart.targetChart.build(attFiltData, nodeElem.datum().name, nodeElem.datum().y, nodeElem.datum().dy, timePoints);
        }
      });
    });
  }

  private build(data: any, nodeName: string, elemTop: number, elemHeight: number, timePoints: string[]) {
    const _self = this;

    const columnLabels : any = JSON.parse(localStorage.getItem('columnLabels'));
    this.valuePostFix = (columnLabels == null) ? '' : ' ' + columnLabels.valueNode;

    const correctedTop = elemTop + AppConstants.SANKEY_TOP_MARGIN - AppConstants.SANKEY_NODE_PADDING / 3;
    const correctedHeight =elemHeight + AppConstants.SANKEY_NODE_PADDING * 2 /3;

    if (this.necessaryHeight < correctedTop + correctedHeight) {
      this.necessaryHeight = correctedTop + correctedHeight;
      this.$node.attr('height', correctedTop + correctedHeight);
    }

    const aggregatedData = _self.prepareData(data, nodeName);
    _self.drawBarChart(aggregatedData, nodeName, correctedTop, correctedHeight, timePoints);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    const _self = this;
    events.on(AppConstants.EVENT_FILTER_CHANGED, (evt, data) => {
      // On filters discard everything to allow a clean redraw
      _self.$node.html('');
    });

    events.on(AppConstants.EVENT_RESIZE_WINDOW, (data) => {
      this.chartWidth = (d3.select('.left_bars') as any).node().getBoundingClientRect().width - OFFSET;
      this.$node.attr('width', this.chartWidth);
      _self.$node.html('');
    });

    // If filtered quarter changes -> keep track of active quarters based on filtered data
    events.on(AppConstants.EVENT_SLIDER_CHANGE, (evt, filteredData) => {
      _self.activeQuarters = d3.set(
        filteredData.map(function (d: any) { return d.timeNode; })
      ).values().sort();
    });
  }

  /**
   * This method returns the sum of flows from/to the node for each time unit
   * @param data raw data, a JSON of all flows
   * @param nodeName name of the node for which the barchart is drawn
   */
  private prepareData(data: any, nodeName: string): IKeyValue[] {
    const _self = this;
    const filteredData = data.filter(function (d) { return d[_self.field] === nodeName; });
    const aggregatedData = d3.nest()
      .key(function (d: any) { return d.timeNode; })
      .rollup(function (v) { return d3.sum(v, function (d: any) { return d.valueNode; }); })
      .entries(filteredData);

    return aggregatedData;
  }

  /**
   * This method draws bars based on data.
   * @param aggregatedData one value for each time unit
   * @param nodeName name of the node for which the barchart is drawn
   * @param dy vertical offset from sankey diagram
   */
  private drawBarChart(aggregatedData: IKeyValue[], nodeName: string, elemTop: number, elemHeight: number, timePoints: string[]) {
    const _self = this;

    const x = d3.scale.ordinal().rangeRoundBands([0, this.chartWidth], .05);
    const y = d3.scale.linear().range([CHART_HEIGHT, 0]);

    const yBaseline = elemTop + elemHeight / 2 - CHART_HEIGHT / 2;

    x.domain(timePoints);
    y.domain([0, d3.max(aggregatedData, function (d) { return d.values; })]);

    const group = this.$node.append('g');

    // add a white background rect that can catch mouseenter events
    group.append('rect')
    .attr('x', 0)
    .attr('y', elemTop)
    .attr('width', this.chartWidth)
    .attr('height', elemHeight)
    .attr('fill', 'white');

    group.on('mouseenter', (d) => {
      const overlay = _self.$node.append('g')
        .classed('overlay', true)
        .on('mouseleave', (d) => {
          const overlays = d3.selectAll('svg.barchart g.overlay');
          overlays.remove();
        });

      const y1 = Math.min(yBaseline - 4 - 13, elemTop);
      const y2 = Math.max(yBaseline + CHART_HEIGHT + 13 + 3, elemTop + elemHeight);

      overlay.html(`
      <rect x='0' y='${y1}' width='${_self.chartWidth}' height='${y2 -y1}' fill="white" />
      <text id='flowtotals' x='${2}' y='${yBaseline - 4}' style='text-anchor: start'>${this.generateFlowTotalsText(aggregatedData, timePoints)}</text>

      <text x='${this.chartWidth/2}' y='${yBaseline + CHART_HEIGHT + 13}' style='text-anchor: middle'>time</text>
      <text x='${2}' y='${yBaseline + CHART_HEIGHT + 13}' style='text-anchor: start'>${TimeFormat.format(timePoints[0])}</text>
      <text x='${this.chartWidth - 2}' y='${yBaseline + CHART_HEIGHT + 13}' style='text-anchor: end'>${TimeFormat.format(timePoints[timePoints.length-1])}</text>
      `);
      d3TextWrap(d3.select('text#flowtotals'), this.chartWidth, 2);

      overlay.selectAll('bar')
        .data(aggregatedData)
        .enter().append('rect')
        .classed('bar', true)
        .classed('active', function (d, i) { return (_self.activeQuarters.indexOf(d.key) >= 0); })
        .attr('x', function (d, i) { return x(d.key); })
        .attr('width', x.rangeBand())
        .attr('y', function (d) { return y(d.values) + yBaseline; })
        .attr('height', function (d) { return CHART_HEIGHT - y(d.values); })
        // bar hover -- update text above barchart
        .on('mouseover', (d) => {
          d3.select('text#flowtotals').text(`Total flows in ${TimeFormat.format(d.key)}: ${dotFormat(d.values) + _self.valuePostFix}`);
        })
        .on('mouseout', (d) => {
          const text = d3.select('text#flowtotals');
          text.text(_self.generateFlowTotalsText(aggregatedData, timePoints));
          d3TextWrap(text, this.chartWidth, 2);
        });
    });

    group.selectAll('bar')
      .data(aggregatedData)
      .enter().append('rect')
      .classed('bar', true)
      .classed('active', function (d, i) { return (_self.activeQuarters.indexOf(d.key) >= 0); })
      .attr('x', function (d, i) { return x(d.key); })
      .attr('width', x.rangeBand())
      .attr('y', function (d) { return y(d.values) + yBaseline; })
      .attr('height', function (d) { return CHART_HEIGHT - y(d.values); });
  }

  private generateFlowTotalsText(aggregatedData: IKeyValue[], timePoints: string[]): string {
    const activeSum = aggregatedData
      .filter((d, i) => {return (this.activeQuarters.indexOf(d.key) >= 0);})
      .map((d) => d.values)
      .reduce((total, current) => total + current);

    return 'Total flows in ' + TimeFormat.formatMultiple(this.activeQuarters, timePoints) + ': ' + dotFormat(activeSum) + this.valuePostFix;
  }
}

/**
 * Factory method to create a new SparklineBarChart instance
 * @param parent
 * @param options
 * @returns {SparklineBarChart}
 */
export function create(parent: Element, options: any) {
  return new SparklineBarChart(parent, options);
}
