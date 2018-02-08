/**
 * Created by cniederer on 21.04.17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';

class SankeyFeatures implements MAppViews {

  private $node;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('sankey_features', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<SankeyDiagram>}
   */
  init() {
    this.build();
    this.attachListener();

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements
   */
  private build() {
     this.$node.html(`
      <div class='container-fluid'>
      	<div class='row'>
      		<div class='col-md-3'>
      			<h5>Filter</h5>
      			<div class='row'>
              <div class='col-md-3'>
                <button type='button' class= 'btn_design' id='clearAllFilters' class='btn btn-default'>
                  Clear All
                </button>
              </div>
              <div class='col-md-3'>
                  <div class='btn-group'>
                    <button class= 'btn_design' class='btn btn-default'>Time</button>      						
                  </div>
                </div>
              <div class='col-md-3'>
                  <div class='btn-group'>
                    <button class ='btn_design' class='btn btn-default'>Attribute</button>      						
                  </div>
                </div>
      			</div>
      			<div class='row'>
      			<p>
      				<div class='col-md-12'>
      					 <span class='label label-default'>2016Q2 - 2017Q1</span>
      				</div>
      			</p>
      			</div>
      		</div>

          <!--Global Filters-->
          <div class='col-md-3'>
            <div class='row'>
              <div class='col-md-12'>
                <div class='row'>
                  <div class='col-md-6' id = 'btn_above'>
                    <h5>Show State <i class='fa fa-question-circle' aria-hidden='true'></i></h5>
                    <button type='button' class ='btn_design' class='btn btn-default'>Absolute Value</button>                   
                    <button type='button' class ='btn_design' class='btn btn-default'>Number of Links</button>
                  </div>
                  <div class='col-md-6' id = 'btn_above'>
                    <h5>Show Change <i class='fa fa-question-circle' aria-hidden='true'></i></h5>
                    <button type='button' class ='btn_design' class='btn btn-default'>Absolute Value</button>
                    <button type='button' class ='btn_design' class='btn btn-default'>Relative Value</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        <!--Export Settings-->
        <div class='col-md-2'>
          <h5>Export Settings</h5>
          <button type='button' class= 'btn_design' class='btn btn-default' id='exportData'>
            Export Data
          </button>
        </div>

          <!--Notebook-->
      		<div class='col-md-2'>
      			<h5>Notebook</h5>
      			<button type='button' class= 'btn_design' class='btn btn-default'>
      				Notebook
      			</button>
      		</div>
      	</div>
      </div>
    `);
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
  return new SankeyFeatures(parent, options);
}
