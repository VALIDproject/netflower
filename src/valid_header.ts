/**
 * Created by cniederer on 18.04.17.
 */


import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import {MAppViews} from './app';

class ValidHeader implements MAppViews {

  private $node;

 constructor(parent: Element, private options: any) {
    this.$node = d3.select('#validHeader');
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
    this.$node.html(`
    <div class="logo"></div>
    <div class="btn_preupload">
      <button type='button' id='backBtn' class='btn btn-sm btn-secondary'>
      <i class='fa fa-hand-o-left'>&nbsp;</i>Reupload Data</button>
    </div>


    <!--<div class='col-md-2'>
      <button type='button' id='backBtn' class='btn btn-sm btn-secondary'>
        <i class='fa fa-hand-o-left'>&nbsp;</i>Reupload Data</button>
    </div>-->

    <div id="socialMedia">
        <p><a href="https://twitter.com/valid_at" target ="blank"><i class="fa fa-twitter-square fa-2x" id="web" ></i></a> </p>
        <p><a href="https://github.com/VALIDproject" target="blank"> <i class="fa fa-github fa-2x" id="web"></i></a> </p>
        <p><a href="http://www.validproject.at/" target ="blank"><i class="fa fa-globe fa-2x" id="web"></i></a></p>
    </div>
    `);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
            //Listener for the Back Button
    this.$node.select('#backBtn')
      .on('click', (e) => {
        bootbox.confirm({
          className: 'dialogBox',
          title: 'Information',
          message: `Upon hitting the <strong>OK</strong> button, you will be redirected to the data upload page.<br/>
          <strong>NOTE:</strong> This will reload the page and the previous data will be lost!!<br/><br/>
          Be sure you don't lose anything important or save your progress before you proceed.`,
          callback: function(result) {
            if (result) {
              //Clear both storage facilities
              localStorage.clear();
              localforage.clear();
              //Remove all elements that get not created from the DOM
              d3.select('.dataVizView').selectAll('*').remove();
              //Force reload and loose all data
              location.reload(true);
            } else {
              return;
            }
          }
        });

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });
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
