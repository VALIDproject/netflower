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

    this.$node.select('.fh');



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
