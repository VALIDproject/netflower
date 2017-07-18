/**
 * Created by rind on 5/30/17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import {MAppViews} from './app';

class SparklineBarChart implements MAppViews {

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

    var media = ["Tiroler Tageszeitung", "ORF Radio Tirol", "Tirolerin",  "ORF2", "Kleine Zeitung", "Die Presse", "Kronen Zeitung", "NÖN", "Salzburger Nachrichten", "Kurier", "BVZ", "Blick ins Land", "ExtraDienst"];

     for (var d of media) {
       this.build("div.right_bars", "targetNode", d);
 }

     var legal = ["Agrarmarketing Tirol (Verein)", "Agrarmarkt Austria Marketing GesmbH"];

     for (var d of legal) {
       this.build("div.left_bars", "sourceNode", d);
 }

//       this.build("div.right_bars", "Tiroler Tageszeitung");

    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements
   */
  private build(parent, field, medium) {
//        console.log("Now executing SparklineBarChart :-)");
//     this.$node.html(`
//     <p>This will turn into a sparkline barchart</p>
//        `);

            //This is how we retrieve the data. As it's loaded async it is only available as promise.
        //We can save the promise thoug in a global variable and get the data later if we need
        this.promiseData = localforage.getItem('data').then((value) => {
          return value;
        });

        //Within the {} the data is available for usage
        this.promiseData.then(function (data) {
          // TODO get legalEnt/medium name into this scope
          var filtered_data = data.filter(function(d) { return d[field] == medium; });
          var aggregated_data = d3.nest()
            .key(function(d) { return d.timeNode; })
            .rollup(function(v) { return d3.sum(v, function(d) { return d.valueNode; })})
            .entries(filtered_data);
          console.log('spark data for ', field, ' : ', medium, ' :');
          console.log(JSON.stringify(aggregated_data));

    let width = 120;
    let height = 40;

    let x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
    let y = d3.scale.linear().range([height, 0]);
    let xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
    let yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);

    x.domain(aggregated_data.map(function(d,i) { return d.key; }));
    y.domain([0, d3.max(aggregated_data, function(d) { return d.values; })]);

    let svg = d3.select(parent).append("svg")
    .attr("width", width)
    .attr("height", height);

svg.selectAll("bar")
      .data(aggregated_data)
    .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", function(d, i) { return x(d.key); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.values); })
      .attr("height", function(d) { return height - y(d.values); });

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
