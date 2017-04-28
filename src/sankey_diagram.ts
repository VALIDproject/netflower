/**
 * Created by Florian on 12.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import {MAppViews} from './app';
import 'imports-loader?d3=d3!../lib/sankey.js';

class SankeyDiagram implements MAppViews {

  private $node;


  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('sankey_diagram', true);
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
    this.$node.append('div').attr('class', 'left_bars');
    this.$node.append('div').attr('class', 'sankey_vis');
    this.$node.append('div').attr('class', 'right_bars');

    this.buildSankey();

  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
  }


  private buildSankey() {

    console.log(this.$node);

    const sankey = (<any>d3).sankey();
    console.log('Sankey Object', sankey);

    const units = '€';

    /* let widthNode = this.$node.select('.sankey_vis').node();
     widthNode.getBoundingClientRect().width;
     console.log('width',  widthNode);*/

    let widthNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().width;
    console.log('width',  widthNode);

    let heightNode = this.$node.select('.sankey_vis').node().getBoundingClientRect().height;
    console.log('height',  heightNode);

    const margin = {top: 10, right: 80, bottom: 10, left: 80};
    const width =  widthNode  - margin.left - margin.right;
    const height = heightNode - margin.top - margin.bottom;

    // The "0" option enables zero-padding.
    //The comma (",") option enables the use of a comma for a thousands separator.
    //????
    const formatNumber = d3.format(',.0f'),    // zero decimal places
      format = function(d) { return formatNumber(d) + " " + units; },
      color = d3.scale.category20();

    // append the svg canvas to the page
    const svg = d3.select(".sankey_vis").append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform','translate(' + margin.left+ ',' + margin.top + ')');

    sankey.nodeWidth(35)
      .nodePadding(20)
      .size([width, height]);

    const path = sankey.link();
    console.log('path', path);
    
  }

}

/**
 * Factory method to create a new SankeyDiagram instance
 * @param parent
 * @param options
 * @returns {SankeyDiagram}
 */
export function create(parent: Element, options: any) {
  return new SankeyDiagram(parent, options);
}
