/**
 * Created by Christina on 21.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import 'imports-loader?jQuery=jquery!BootSideMenu/js/BootSideMenu.js';
import 'style-loader!css-loader!BootSideMenu/css/BootSideMenu.css';
import {MAppViews} from './app';

class GlobalSettings implements MAppViews {

  private $node: d3.Selection<any>;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('globalSettings', true);
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
    this.$node.html(`
    <div id='menuTest'>
      <div class='list-group'>
          <a href='#item-1' class='list-group-item' data-toggle='collapse'>Item 1</a>
          <div class='list-group collapse' id='item-1'>
              <a href='#' class='list-group-item'>Item 1 di 1</a>
              <a href='#' class='list-group-item'>Item 2 di 1</a>
              <a href='#item-1-1' class='list-group-item' data-toggle='collapse'>Item 3 di 1</a>
              <div class='list-group collapse' id='item-1-1'>
                  <a href='#' class='list-group-item'>Item 1 di 1.3</a>
                  <a href='#' class='list-group-item'>Item 2 di 1.3</a>
                  <a href='#' class='list-group-item'>Item 3 di 1.3</a>
              </div>
          </div>
      </div>
    </div>
    `);

    (<any>$('#menuTest')).BootSideMenu();
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
  return new GlobalSettings(parent, options);
}
