/**
 * Created by rind on 9/19/17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import { AppConstants } from './app_constants';
import { MAppViews } from './app';
import { dotFormat } from './utilities';

const formatTime = d3.time.format('%Y-%m-%d %H:%M:%S');
// const formatTime = d3.time.format('%H:%M:%S');
const SEPARATOR = ';';

export default class SimpleLogging implements MAppViews {

  // for the UI (= button)
  private $node: d3.Selection<any>;
  private parentDOM: string;

  /** singleton for logging */
  private static instance;

  /** cached log messages */
  private logs: string[] = [];


  constructor(parent: Element, private options: any) {
    this.parentDOM = options.parentDOM;
    SimpleLogging.instance = this;
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<MAppViews>}
   */
  init(): Promise<MAppViews> {
    this.$node = d3.select(this.parentDOM)
      .append('button')
      .attr('type', 'button')
      .attr('id', 'submitLog')
      .attr('class', 'btn btn-primary btn-sm')
      .style('margin-top', '10px')
      .style('display', 'block')
      .text('Submit Log');

    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // retrieve the log file
    this.$node.on('click', (d) => {
      console.log('submit log (to be developed)');
      for (const item of this.logs) {
        console.log(item);
      }
    });
  }

  public static log(category: string, payload: any) {
    const msg = formatTime(new Date()) + SEPARATOR + category + SEPARATOR + JSON.stringify(payload);
    SimpleLogging.instance.logs.push(msg);
    console.log('log preview: ' + msg);
  }
}

/**
 * Factory method to create a new SimpleLogging instance
 * @param parent
 * @param options
 * @returns {SparklineBarChart}
 */
export function create(parent: Element, options: any) {
  return new SimpleLogging(parent, options);
}
