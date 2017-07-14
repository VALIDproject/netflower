/**
 * Created by cniederer on 21.04.17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
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
    <div class="heading"><h4>Media Transparency Data set</h4></div>
    <div class="button_bar">
      <div class="btn-group" role="group" aria-label="...">
        <button type="button" class="btn btn-default">  <i class="fa fa-arrows-h fa-lg" aria-hidden="true"></i></button>
        <button type="button" class="btn btn-default"><i class="fa fa-object-group fa-lg" aria-hidden="true"></i></button>
        <button type="button" class="btn btn-default"><i class="fa fa-thumb-tack fa-lg" aria-hidden="true"></i></button>
        <button type="button" class="btn btn-default"><i class="fa fa-camera fa-lg" aria-hidden="true"></i></button>
      </div>
    </div>
    `);

  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    this.createButtonBar();
  }

  private createButtonBar () {
    let button_bar = this.$node.select('.button_bar');
    console.log('button_bar', button_bar);
    // button_bar.append('div').attr('class', 'switch_side');
    // button_bar.append('div').attr('class', 'createGroup');
    // button_bar.append('div').attr('class', 'pinning');
    // button_bar.append('div').attr('class', 'addToNotes');
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
