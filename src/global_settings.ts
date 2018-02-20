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
import {AppConstants} from './app_constants';

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
    <div id='sideMenu'>
      <div class='list-group'>
      <h4>Notebook</h4>
      <input type='text' name='' value=''>
      <button type='button' class='btn btn-primary btn-sm'>Save Note</button>
        <!--<h4>Global Settings</h4>
        <p>Show State <i class='fa fa-question-circle' aria-hidden='true'></i></p>
        <button type='button' class='btn btn-default active'>Absolute Value</button>
        <button type='button' class='btn btn-default'>Number of Links</button>
      </div>

      <div class='showChange'>
      <p>Show Change <i class='fa fa-question-circle' aria-hidden='true'></i></p>
        <button type='button' class='btn btn-default'>Absolute Value</button>
        <button type='button' class='btn btn-default'>Relative Value</button>
      </div>-->
      
      <div class='clearBox'>
        <hr/>
        <button type='button' id='clearAllFilters' class='btn btn-primary btn-sm'>Clear All Filters</button>
      </div>
    </div>
    `);

    (<any>$('#sideMenu')).BootSideMenu();
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    this.$node.select('#clearAllFilters').on('click', (d) => {
      events.fire(AppConstants.EVENT_CLEAR_FILTERS, d, null);
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
  return new GlobalSettings(parent, options);
}
