/**
 * Created by cniederer on 18.04.17.
 */


import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
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

    console.log(this.$node);
    this.$node.html(` 
    <div class="logo"></div>    
    <div id="socialMedia">
    <p>Project Website: <a href="http://www.validproject.at/">http://www.validproject.at</a></p>
    <p>Twitter  </p>
    <p>Github  </p>
    <i class="fa fa-camera-retro"></i>
    
    </div>`);




  }

  /**
   * Attach the event listeners
   */
  private attachListener() {

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
