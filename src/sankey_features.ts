/**
 * Created by cniederer on 21.04.17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import {MAppViews} from './app';

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

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements
   */
  private build() {
     this.$node.html(`
      <!--<div class='container'>
        <div class='row align-items-start'>
          <div class='col-md-8'>
            <div class='heading'><h4>Media Transparency Data set</h4></div>
          </div>
          <div class='col-md-4'>
            <div class='button_bar'>
              <div class='btn-group' role='group' aria-label='...'>
                <button type='button' class='btn btn-default'>  <i class='fa fa-arrows-h fa-lg' aria-hidden='true'></i></button>
                <button type='button' class='btn btn-default'><i class='fa fa-object-group fa-lg' aria-hidden='true'></i></button>
                <button type='button' class='btn btn-default'><i class='fa fa-thumb-tack fa-lg' aria-hidden='true'></i></button>
                <button type='button' class='btn btn-default'><i class='fa fa-camera fa-lg' aria-hidden='true'></i></button>
              </div>
            </div>
          </div>
        </div>
      </div>-->


      <div class="container-fluid">
      	<div class="row">
      		<div class="col-md-4">
      			<h5>
      				Filter
      			</h5>
      			<div class="row">
            <div class="col-md-3">
              <button type="button" class="btn btn-default">
                Clear All
              </button>
            </div>
      				<div class="col-md-3">
      					<div class="btn-group">
      						<button class="btn btn-default">
      							Time
      						</button>
      						<button data-toggle="dropdown" class="btn btn-default dropdown-toggle">
      							<span class="caret"></span>
      						</button>
      						<ul class="dropdown-menu">
      							<li>
      								<a href="#">Action</a>
      							</li>
      							<li class="disabled">
      								<a href="#">Another action</a>
      							</li>
      							<li class="divider">
      							</li>
      							<li>
      								<a href="#">Something else here</a>
      							</li>
      						</ul>
      					</div>
      				</div>
      				<div class="col-md-4">
      					<div class="btn-group">
      						<button class="btn btn-default">
      							Paragraph
      						</button>
      						<button data-toggle="dropdown" class="btn btn-default dropdown-toggle">
      							<span class="caret"></span>
      						</button>
      						<ul class="dropdown-menu">
      							<li>
      								<a href="#">Action</a>
      							</li>
      							<li class="disabled">
      								<a href="#">Another action</a>
      							</li>
      							<li class="divider">
      							</li>
      							<li>
      								<a href="#">Something else here</a>
      							</li>
      						</ul>
      					</div>
      				</div>

      			</div>
      			<div class="row">
            <p>
      				<div class="col-md-12">
      					 <span class="label label-default">2016Q2 - 2017Q1</span>
      				</div>
              </p>
      			</div>
      		</div>

          <!--Global Filters-->
          <div class="col-md-3">
            <div class="row">
              <div class="col-md-12">
                <div class="row">
                  <div class="col-md-6">
                    <h5>
                      Show State
                    </h5>
                    <button type="button" class="btn btn-default">
                      Absolute Value
                    </button>
                    <button type="button" class="btn btn-default">
                      Number of Links
                    </button>
                  </div>
                  <div class="col-md-6">
                    <h5>
                      Show Change
                    </h5>
                    <button type="button" class="btn btn-default">
                      Absolute Value
                    </button>
                    <button type="button" class="btn btn-default">
                      Relative Value
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>





                    <!--Export Settings-->
                		<div class="col-md-2">
                			<h5>
                				Export Settings
                			</h5>
                			<button type="button" class="btn btn-default" id="exportData">
                				Export Data
                			</button>
                		</div>



          <!--Notebook-->
      		<div class="col-md-2">
      			<h5>
      				Notebook
      			</h5>
      			<button type="button" class="btn btn-default">
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
    //this.createButtonBar();
  }

  private createButtonBar () {
    const buttonBar = this.$node.select('.button_bar');
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
