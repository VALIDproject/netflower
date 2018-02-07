/**
 * Created by cniederer on 18.04.17.
 */


import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import {MAppViews} from './app';
import SimpleLogging from './simpleLogging';

class ValidHeader implements MAppViews {

  private $node;

 constructor(parent: Element, private options: any) {
    this.$node = d3.select('#validFooter');
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<ValidHeader>}
   */
  init() {
    this.build();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    this.$node.html(`

  <div class="footer">This footer will always be positioned at the bottom of the page, but <strong>not fixed</strong>.</div>
    `);
  }

}

/**
 * Factory method to create a new ValidHeader instance
 * @param parent
 * @param options
 * @returns {ValidHeader}
 */
export function create(parent: Element, options: any) {
  return new ValidHeader(parent, options);
}
