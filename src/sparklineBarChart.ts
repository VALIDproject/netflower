/**
 * Created by rind on 5/30/17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import {MAppViews} from './app';

const CHART_WIDTH = 120;
const CHART_HEIGHT = 20;

export default class SparklineBarChart implements MAppViews {

  private $node;
  private promiseData;

 constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('barchart', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<ValidHeader>}
   */
  init() {

    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * build sparkline barcharts for enter selection of sankey nodes.
   * This function can be passed to the call method of a d3 selection.
   * @param node
   */
  public static createSparklines(node: d3.Selection<any>) {
    console.log("sparkline called with: " + node.size() + " elements.");

    node.each(function (d, i) {
      let nodeElem = d3.select(this);
      // console.log("build sparkline for " + nodeElem.datum().name + "d.y: " + nodeElem.datum().name.y );

      if (nodeElem.attr("class").includes("source")) {
        SparklineBarChart.build("div.left_bars", "sourceNode", nodeElem.datum().name);
      } else {
        SparklineBarChart.build("div.right_bars", "targetNode", nodeElem.datum().name);
      }
    });
  }

  /**
   * Build the basic DOM elements
   */
  private static build(parent: string, field: string, medium: string) {
    //        console.log("Now executing SparklineBarChart :-)");
    //     this.$node.html(`
    //     <p>This will turn into a sparkline barchart</p>
    //        `);

    //This is how we retrieve the data. As it's loaded async it is only available as promise.
    //We can save the promise thoug in a global variable and get the data later if we need
    let promiseData = localforage.getItem('data').then((value) => {
      return value;
    });

    //Within the {} the data is available for usage
    promiseData.then(function (data: any) {
      // TODO get legalEnt/medium name into this scope
      var filtered_data = data.filter(function (d) { return d[field] == medium; });
      var aggregated_data = d3.nest()
        .key(function (d: any) { return d.timeNode; })
        .rollup(function (v) { return d3.sum(v, function (d: any) { return d.valueNode; }) })
        .entries(filtered_data);
      // console.log('spark data for ', field, ' : ', medium, ' :');
      // console.log(JSON.stringify(aggregated_data));

      let x = d3.scale.ordinal().rangeRoundBands([0, CHART_WIDTH], .05);
      let y = d3.scale.linear().range([CHART_HEIGHT, 0]);
      let xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");
      let yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(10);

      x.domain(aggregated_data.map(function (d, i) { return d.key; }));
      y.domain([0, d3.max(aggregated_data, function (d) { return d.values; })]);

      let svg = d3.select(parent).append("svg")
        .attr("width", CHART_WIDTH)
        .attr("height", CHART_HEIGHT);

      svg.selectAll("bar")
        .data(aggregated_data)
        .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function (d, i) { return x(d.key); })
        .attr("width", x.rangeBand())
        .attr("y", function (d) { return y(d.values); })
        .attr("height", function (d) { return CHART_HEIGHT - y(d.values); });

    });
  }

  /*
  private timeSeries(table: Array<Object>, source: String) {
    return null;
  } */

  /**
   * Attach the event listeners
   */
  private attachListener() {

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
