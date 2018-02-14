/**
 * Created by rind on 2/14/18.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import { AppConstants } from './app_constants';
import { MAppViews } from './app';
import { downloadFile, randomString } from './utilities';

enum SortMode {
    Flow,
    Source,
    Target
}

interface Flow {
    source:string;
    target:string;
    value:number;
}

const FLOWS_INCREMENT = 15;

export default class FlowSorter implements MAppViews {

  private sortMode: SortMode = SortMode.Flow;
  private showExtent: number = 1;

  private static instance: FlowSorter;

  // for the UI (= button)
  private $node: d3.Selection<any>;
  private parentDOM: string;

  private constructor(parent: Element, private options: any) {
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
      .attr('id', 'sort')
      .attr('class', 'btn btn-primary btn-sm')
      .style('margin-top', '10px')
      .style('display', 'block')
      .text('Flow Sorter');

    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  public topFlows(flatNest: Flow[]): Flow[] {
    console.log('top flows');

    if (this.sortMode === SortMode.Flow) {
      return this.flowOrder(flatNest);
    } else if (this.sortMode === SortMode.Source) {
      return this.sourceOrder(flatNest);
    // } else if (this.sortMode === SortMode.Target) {
    //   return this.targetOrder(flatNest);
    }
  }

  private flowOrder(flatNest: Flow[]): Flow[] {
    const flowsToShow = Math.max(flatNest.length, this.showExtent * 25);
    const x = flatNest.sort((a, b) => {
      return d3.descending(a.value, b.value);
    }).slice(0, flowsToShow);

    return x;
  }

  private sourceOrder(flatNest: Flow[]): Flow[] {
    return [];

  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // retrieve the log file
    this.$node.on('click', (d) => {
      console.log('sort flows');
    });
  }

  // Class is a singleton an therefore only one object can exist => get object with this method
  public static getInstance(parent?: Element, options?: any): FlowSorter {
    if (FlowSorter.instance === null || FlowSorter.instance === undefined) {
        console.log('flowsorter created with parent ' + parent);
        FlowSorter.instance = new FlowSorter(parent, options);
    }

    return FlowSorter.instance;
  }
}

/**
 * Factory method to create a new FlowSorter instance
 * @param parent
 * @param options
 * @returns {FlowSorter}
 */
export function create(parent: Element, options: any) {
    return FlowSorter.getInstance(parent, options);
}
