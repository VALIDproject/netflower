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
      	  <!--First section on the left with filters-->
      		<div class='col-md-4'>
            <div class='row'>
              <div class='col-sm-3'>
                <h5>Filter</h5>
              </div>
              <div class='col-sm-4' style='margin-top: 7px;'>
                <button id='clearAllBtn' class='label'
                  style='background: #45B07C; font-weight: normal;'><i class='fa fa-times'></i> Clear All</button>
              </div>
              <div class='col-sm-4'>
                <h5>View Flow between:</h5>
              </div>
            </div>
      			<div class='row'>
              <div class='col-md-3'>
                <button id='btnTimeDialog' class='btn btn-default btn_design'>Time</button>      						
              </div>
              <div class='col-md-4'>
                  <div class='btn-group'>
                    <button id='btnAttributeDialog' class='btn btn-default btn_design'>Connection Filter</button>      						
                  </div>
                </div>
                <div class='col-md-4'>
                  <select class='form-control input-sm' id='tagFlowFilter'>
                     <option value='-1' selected>nodes</option>
                     <option value='1'>tags</option>
                  </select>
                </div>
      			</div>
      			<div class='row'>
      			<p>
      				<div class='col-md-3'>
      					 <span id='currentTimeInfo' class='label label-default' style='background: #45B07C'>Nothing</span>
      				</div>
      			</p>
      			</div>
      		</div>
      		
      		<!--Second section with the sort options in hte middle-->
      		<div class='col-md-3'>
      		  <div class='row'>
      		    <div class='col-sm-5'>
      		      <h5>Sort & Order</h5>
              </div>
            </div>
      		  <div class='row' style='margin-bottom: 5px;'>
      		    <div class='col-sm-3'>
      		      <label style='margin-top: 5px;'>Sort by:</label>
      		    </div>
      		    <div class='col-sm-6' id='sortBySelector'></div>
            </div>
            <div class='row'>
              <div class='col-sm-3'>
      		      <label style='margin-top: 5px;'>Order:</label>
      		    </div>
      		    <div class='col-sm-6' id='orderBySelector'></div>
            </div>
          </div>

          <!--Export Settings-->
          <div class='col-md-2'>
            <h5>Miscellaneous</h5>
            <button type='button' class='btn btn-default btn_design' id='exportData'>
              Export Data
            </button>
            <div class='custom-control custom-checkbox' style='margin-top: 4px;'>
              <input type='checkbox' class='custom-control-input' id='exportCheckbox'>
              <label class='custom-control-label' for='exportCheckbox'>Only visible elemments</label>
            </div>
          </div>
          
          <!--Global Filters-->
          <!--<div class='col-md-3'>
            <div class='row'>
              <div class='col-md-12'>
                <div class='row'>
                  <div class='col-md-6' id = 'btn_above'>
                    <h5>Show State <i class='fa fa-question-circle' aria-hidden='true'></i></h5>
                    <button type='button' class='btn btn-default btn_design'>Absolute Value</button>                   
                    <button type='button' class='btn btn-default btn_design'>Number of Links</button>
                  </div>
                  <div class='col-md-6' id = 'btn_above'>
                    <h5>Show Change <i class='fa fa-question-circle' aria-hidden='true'></i></h5>
                    <button type='button' class='btn btn-default btn_design'>Absolute Value</button>
                    <button type='button' class='btn btn-default btn_design'>Relative Value</button>
                  </div>
                </div>
              </div>
            </div>
          </div>-->
      	</div>
      </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    this.$node.select('#clearAllBtn').on('click', (d) => {
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
