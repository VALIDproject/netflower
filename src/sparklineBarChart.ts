/**
 * Created by rind on 5/30/17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import {MAppViews} from './app';

class SparklineBarChart implements MAppViews {

  private $node;

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
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {

  }

}

/**
 * Factory method to create a new Barchart instance
 * @param parent
 * @param options
 * @returns {Barchart}
 */
export function create(parent: Element, options: any) {
  return new SparklineBarChart(parent, options);
}
