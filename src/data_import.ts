/**
 * Created by Florian on 25.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as papaparse from 'papaparse';
// import 'imports-loader?d3=d3!../lib/sankey.js';
import {MAppViews} from './app';

class DataImport implements MAppViews {

  private $node;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('data_import', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<DataImport>}
   */
  init() {
    d3.select('.dataVizView').classed('invisibleClass', true);
    // const sankey = (<any>d3).sankey();
    // console.log('Thats a sankey', sankey);
    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    console.log('Hello from papaparse', papaparse);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
  }

}

/**
 * Factory method to create a new DataImport instance
 * @param parent
 * @param options
 * @returns {DataImport}
 */
export function create(parent: Element, options: any) {
  return new DataImport(parent, options);
}
