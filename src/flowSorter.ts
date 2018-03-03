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

interface Link {
  source:number;
  target:number;
  value:number;
}

interface SNode {
    name: string;
    overall: number;
    fraction: number;
}

interface Graph {
  nodes: SNode[];
  links: Link[];
}

const FLOWS_INCREMENT = 12;
const NODES_INCREMENT = 8;

export default class FlowSorter implements MAppViews {

  private sortMode: SortMode = SortMode.Source;
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

  public showMore() {
    this.showExtent++;
  }

  public showLess() {
    this.showExtent = Math.max(1, this.showExtent - 1);
  }

  public topFlows(flatNest: Flow[]): Graph {
    console.log('top flows');

    if (this.sortMode === SortMode.Flow) {
      return this.flowOrder(flatNest);
    } else if (this.sortMode === SortMode.Source) {
      return this.sourceOrder(flatNest);
    // } else if (this.sortMode === SortMode.Target) {
    //   return this.targetOrder(flatNest);
    }
  }

  private flowOrder(flatNest: Flow[]): Graph {
    const flowsToShow = Math.min(flatNest.length, this.showExtent * FLOWS_INCREMENT);
    const flows = flatNest.sort((a, b) => {
      return d3.descending(a.value, b.value);
    }).slice(0, flowsToShow);

    return this.graphFromNodeFlows([], flows);
  }

  private sourceOrder(flatNest: Flow[]): Graph {
    const valuesSumSource = d3.nest()
      .key((d: Flow) => { return d.source; }) // XXX
      .rollup((v) => { return d3.sum(v, (d: Flow) => { return d.value; }); })
      .entries(flatNest)
      .sort((a, b) => { return d3.descending(a.values, b.values); });

    // const sourceCount = valuesSumSource.length;
    const targetCount = d3.set(flatNest.map((d) => {return d.target; })).size(); // XXX

    console.log('node count source: ' + valuesSumSource.length + ' target: ' + targetCount);

    const sourcesToShow = Math.min(valuesSumSource.length, this.showExtent * NODES_INCREMENT );
    const targetsToShow = Math.min(targetCount, sourcesToShow /  valuesSumSource.length * targetCount );

    console.log('node show source: ' + sourcesToShow + ' target: ' + targetsToShow);

    const flows : Flow[] = [];
    const possibleLinks : Flow[] = [];
    // let targets : SNode[] = [];
    const targets = new Set<string>();

    // copy top sources and their top flow
    for (const source of valuesSumSource.slice(0, sourcesToShow)) {
      const flowsBySource = flatNest.filter((d) => { return d.source === source.key; }); // XXX
      const topFlow = flowsBySource.reduce((l, e) => e.value > l.value ? e : l);

      targets.add(topFlow.target); // XXX
      flows.push(topFlow);
      possibleLinks.push(... flowsBySource.filter((d) => { return d !== topFlow; }));
      console.log('  +  '  + flowsBySource.length);
      console.log('lengths flows: '  + flows.length + ' possible: ' + possibleLinks.length);

    }

    // fill targets by largest individual flows (for consistency to above)
    possibleLinks.sort((a, b) => { return d3.ascending(a.value, b.value); });
    while (targets.size < targetsToShow && possibleLinks.length > 0) {
      const topFlow = possibleLinks.pop();
      flows.push(topFlow);
      targets.add(topFlow.target); // XXX
    }

    // add all missing flows between chosen nodes
    flows.push(... possibleLinks.filter((d) => { return targets.has(d.target); }));

    const nodes: SNode[] = [];
    // calculate 'fraction' & create source nodes
    for (const source of valuesSumSource.slice(0, sourcesToShow)) {
      const visible = flows
        .filter((d) => { return d.source === source.key; })
        .map((d) => d.value)
        .reduce((total, current) => total + current);
      nodes.push({ 'name': source.key, 'overall': source.values, 'fraction': visible / source.values });
    }

    // calculate 'overall' and 'fraction' & create target nodes
    targets.forEach((target) => {
      const overall = flatNest
        .filter((d) => { return d.target === target; })
        .map((d) => d.value)
        .reduce((total, current) => total + current);

      const visible = flows
        .filter((d) => { return d.target === target; })
        .map((d) => d.value)
        .reduce((total, current) => total + current);

      nodes.push({ 'name': target, 'overall': overall, 'fraction': visible / overall });
    });

    return this.graphFromNodeFlows(nodes, flows);
  }

  private graphFromNodeFlows(nodes: SNode[], flows: Flow[]): Graph {
    const nodeNames = nodes.map((d) => { return d.name; });
    const links: Link[] = [];
    flows.forEach(function (d, i) {
      links.push({
        source: nodeNames.indexOf(d.source),
        target: nodeNames.indexOf(d.target),
        value: d.value
      });
    });

    return {'nodes': nodes, 'links': links };
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
