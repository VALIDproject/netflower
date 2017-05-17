/**
 * Created by Christina on 21.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as bootbox from 'bootbox';
import * as localforage from 'localforage';
import {MAppViews} from './app';

class GlobalSettings implements MAppViews {

  private $node: d3.Selection<any>;
  private $genericControls: d3.Selection<any>;
  private promiseData;

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
    d3.select('.globalSettings').append('div').classed('genericControls', true);

    this.$genericControls = d3.select('.genericControls').html(`
      <button type='button' id='backBtn' class='btn btn-secondary'><i class='fa fa-hand-o-left'>&nbsp;</i>Back</button>
      <button type='button' id='getData' class='btn btn-primary'><i class='fa fa-hand-o-left'>&nbsp;</i>Get Data</button>
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
              localStorage.clear();
              localforage.clear();
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

    this.$node.select('#getData')
      .on('click', (e) => {
        this.promiseData = localforage.getItem('data').then((value) => {
          return value;
        });

        this.promiseData.then(function (data) {
          console.log('DATA:::::::: ', data);
        });

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
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
