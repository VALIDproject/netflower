/**
 * Created by cniederer on 18.04.17.
 */
/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import {MAppViews} from './app';

class Valid_header implements MAppViews {

  private $node;

 constructor(parent: Element, private options: any) {  
    this.$node = d3.select('#validHeader')
      .append('div')
      .classed('logo', true);
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

  }

  /**
   * Attach the event listeners
   */
  private attachListener() {

  }

}

/**
 * Factory method to create a new SankeyDiagram instance
 * @param parent
 * @param options
 * @returns {SankeyDiagram}
 */
export function create(parent: Element, options: any) {
  return new Valid_header(parent, options);
}
