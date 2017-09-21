/**
 * Created by rind on 9/19/17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import { AppConstants } from './app_constants';
import { MAppViews } from './app';
import { downloadFile, randomString } from './utilities';

/** key of log records in local storage */
const KEY_LOGS = 'interaction-logs';
const formatTime = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
// const formatTime = d3.time.format('%H:%M:%S');
const FIELD_SEPARATOR = ';';
const RECORD_SEPARATOR = '\n';
/** maximum size of log records in local storage */
const MAX_SIZE = 500000;

export default class SimpleLogging implements MAppViews {

  // for the UI (= button)
  private $node: d3.Selection<any>;
  private parentDOM: string;

  constructor(parent: Element, private options: any) {
    this.parentDOM = options.parentDOM;
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
      console.log('submit log');
      // console.log(this.logs.join('\n'));
      const file = 'log-'+randomString(6) + '.txt';
      const logs = localStorage.getItem(KEY_LOGS);
      if (logs === null) {
        bootbox.alert('No log records available yet.');
      } else {
        downloadFile(logs, file, 'text/plain');
        SimpleLogging.trimLogFile();
      }
    });
  }

  /** records an event to the log */
  public static log(category: string, payload: any) {
    const msg = formatTime(new Date()) + FIELD_SEPARATOR + category + FIELD_SEPARATOR + JSON.stringify(payload);
    console.log('log preview: ' + msg);

    SimpleLogging.appendInStorage(msg);
  }

  private static appendInStorage(msg: string) {
    let logs = localStorage.getItem(KEY_LOGS);
    if (logs === null) {
      logs = msg;
    } else {
      logs = logs + RECORD_SEPARATOR + msg;
    }
    localStorage.setItem(KEY_LOGS, logs);
  }

  /** check size of stored logs and trim older records if needed */
  public static trimLogFile() {
    let logs = localStorage.getItem(KEY_LOGS);
    if (logs !== null && logs.length > MAX_SIZE) {
      const index = logs.indexOf(RECORD_SEPARATOR, logs.length - MAX_SIZE);
      logs = logs.slice(index);
      localStorage.setItem(KEY_LOGS, logs);
    }
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
