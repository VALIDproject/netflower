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
    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
        console.log("Hello Alex im barchart");
    this.$node.html(`
    <p>Hello World</p>
       `);

            //This is how we retrieve the data. As it's loaded async it is only available as promise.
        //We can save the promise thoug in a global variable and get the data later if we need
        this.promiseData = localforage.getItem('data').then((value) => {
          return value;
        });

        //Within the {} the data is available for usage
        this.promiseData.then(function (data) {
          // TODO get legalEnt/medium name into this scope
          var filtered_data = data.filter(function(d) { return d.mediumMedieninhaber == "Kurier"; });
          var aggregated_data = d3.nest()
            .key(function(d) { return d.quartal; })
            .rollup(function(v) { return d3.sum(v, function(d) { return d.euro; }})
            .entries(filtered_data);
          console.log('spark data: ', JSON.stringify(aggregated_data));
        });
  }

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
