/**
 * Created by rind on 2/14/18.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import { AppConstants } from './app_constants';
import { MAppViews } from './app';
import { dotFormat } from './utilities';
import SimpleLogging from './simpleLogging';

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

const FLOWS_INCREMENT = 12;
const NODES_INCREMENT = 8;
const NODES_INCR_OTHER = 10;
const SORT_TYPES = ['flow', 'source', 'target'];
const ORDER_TYPES = ['descending', 'ascending'];

export default class FlowSorter implements MAppViews {

  private sortType: string = SORT_TYPES[0];
  private orderType: string = ORDER_TYPES[0];
  private showExtent: number = 1;

  private canShowMore: boolean = true;
  private messages: string[] = ['unset', 'unset'];

  private static instance: FlowSorter;

  // For the SORT BY option
  private $node: d3.Selection<any>;
  private parentDOM: string;
  // For the ORDER BY option
  private $node2: d3.Selection<any>;
  private parentDOM2: string;


  private constructor(parent: Element, private options: any) {
    this.parentDOM = options.sortBySelector;
    this.parentDOM2 = options.orderBySelector;
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<MAppViews>}
   */
  init(): Promise<MAppViews> {
    this.$node = d3.select(this.parentDOM)
      .append('select')
      .attr('class', 'form-control input-sm')
      .attr('id', 'sortDropdown')
      .style('display', 'block');

    this.$node2 = d3.select(this.parentDOM2)
      .append('select')
      .attr('class', 'form-control input-sm')
      .attr('id', 'orderDropdown')
      .style('display', 'block');

    for (const sortType of SORT_TYPES) {
      this.$node.append('option')
        .attr('value', sortType)
        .attr('selected', this.sortType === sortType ? 'selected' : null)
        .text(sortType);
    }

    for (const orderType of ORDER_TYPES) {
      this.$node2.append('option')
        .attr('value', orderType)
        .attr('selected', this.orderType === orderType ? 'selected' : null)
        .text(orderType);
    }

    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  public showMore() {
    this.showExtent++;
    SimpleLogging.log('show more; '+ this.sortType + '; ' + this.orderType + '; ', this.showExtent);
  }

  public showLess() {
    this.showExtent = Math.max(1, this.showExtent - 1);
    SimpleLogging.log('show less; '+ this.sortType + '; ' + this.orderType + ';', this.showExtent);
  }

  public hasShowLess() {
    return this.showExtent > 1;
  }

  public hasShowMore() {
    return this.canShowMore;
  }

  public getExtent(): number {
    return this.showExtent;
  }

  public getMessage(i: number) {
    return this.messages[i];
  }

  public topFlows(flatNest: Flow[], valuePostFix: string): any {
    const descending: boolean = (this.orderType === ORDER_TYPES[0]);

    if (this.sortType === SORT_TYPES[0]) {
      return this.flowOrder(flatNest, valuePostFix, descending);
    } else if (this.sortType === SORT_TYPES[1]) {
      return this.nodeOrder(flatNest, valuePostFix, true, descending);
    } else if (this.sortType === SORT_TYPES[2]) {
      return this.nodeOrder(flatNest, valuePostFix, false, descending);
    }
  }

  private flowOrder(flatNest: Flow[], valuePostFix: string, descending: boolean): any {
    const flowsToShow = Math.min(flatNest.length, this.showExtent * FLOWS_INCREMENT);
    const flows = flatNest.sort((a, b) => {
      if (descending) {
        return d3.descending(a.value, b.value);
      } else {
        return d3.ascending(a.value, b.value);
      }
    }).slice(0, flowsToShow);

    const nodes: SNode[] = [];
    (new Set(flows.map((d) => { return d.source; }))).forEach((source) => {
      const visible = this.sumValues(flows, source, true);
      const overall = this.sumValues(flatNest, source, true);
      nodes.push({ 'name': source, 'overall': overall, 'fraction': visible / overall });
    });
    (new Set(flows.map((d) => { return d.target; }))).forEach((target) => {
      const visible = this.sumValues(flows, target, false);
      const overall = this.sumValues(flatNest, target, false);
      nodes.push({ 'name': target, 'overall': overall, 'fraction': visible / overall });
    });

    // prepare infos for user interface
    this.canShowMore = flowsToShow < flatNest.length;
    this.messages[0] = (flowsToShow < flatNest.length)
      ? `Flows ${descending ? '≤' : '≥'} ${dotFormat(flatNest[flowsToShow].value)}${valuePostFix} are not displayed.`
      : 'All flows are displayed.';
    this.messages[1] = `${flowsToShow}/${flatNest.length} flows displayed`;

    return this.graphFromNodeFlows(nodes, flows);
  }

  /**
   *
   * @param flatNest
   * @param valuePostFix
   * @param bySource switch whether to sort by source or target
   */
  private nodeOrder(flatNest: Flow[], valuePostFix: string, bySource: boolean, descending: boolean): any {
    const valuesSumSource = d3.nest()
      .key((d: Flow) => { return bySource ? d.source : d.target; }) // XXX
      .rollup((v) => { return d3.sum(v, (d: Flow) => { return d.value; }); })
      .entries(flatNest)
      .sort((a, b) => {
        if (descending) {
          return d3.descending(a.values, b.values);
        } else {
          return d3.ascending(a.values, b.values);
        }
      });

    const targetCount = d3.set(flatNest.map((d) => {return (bySource ? d.target : d.source); })).size(); // XXX

    const typeOfNode = bySource ? 'source' : 'target';
    console.log(`node count ${typeOfNode}: ${valuesSumSource.length} other: ${targetCount}`);

    const sourcesToShow = Math.min(valuesSumSource.length, this.showExtent * NODES_INCREMENT );
    const targetsToShow = Math.min(targetCount, sourcesToShow * targetCount / valuesSumSource.length, this.showExtent * NODES_INCR_OTHER );

    console.log(`node show ${typeOfNode}: ${sourcesToShow} other: ${targetsToShow}`);

    const flows : Flow[] = [];
    const possibleLinks : Flow[] = [];
    // let targets : SNode[] = [];
    const targets = new Set<string>();

    // copy top sources and their top flow
    for (const source of valuesSumSource.slice(0, sourcesToShow)) {
      const flowsBySource = flatNest.filter((d) => { return source.key === (bySource ? d.source : d.target); }); // XXX
      const topFlow = flowsBySource.reduce((l, e) => e.value > l.value ? e : l);

      targets.add(bySource ? topFlow.target : topFlow.source); // XXX
      flows.push(topFlow);
      possibleLinks.push(... flowsBySource.filter((d) => { return d !== topFlow; }));
    }

    // fill targets by largest individual flows (for consistency to above)
    possibleLinks.sort((a, b) => { return d3.ascending(a.value, b.value); });
    while (targets.size < targetsToShow && possibleLinks.length > 0) {
      const topFlow = possibleLinks.pop();
      flows.push(topFlow);
      targets.add(bySource ? topFlow.target : topFlow.source); // XXX
    }

    // add all missing flows between chosen nodes
    flows.push(... possibleLinks.filter((d) => { return targets.has(bySource ? d.target : d.source); })); // XXX

    const nodes: SNode[] = [];
    // calculate 'fraction' & create source nodes
    for (const source of valuesSumSource.slice(0, sourcesToShow)) {
      const visible = this.sumValues(flows, source.key, bySource);
      nodes.push({ 'name': source.key, 'overall': source.values, 'fraction': visible / source.values });
    }

    // calculate 'overall' and 'fraction' & create target nodes
    targets.forEach((target) => {
      const visible = this.sumValues(flows, target, ! bySource);
      const overall = this.sumValues(flatNest, target, ! bySource);
      nodes.push({ 'name': target, 'overall': overall, 'fraction': visible / overall });
    });

    // prepare infos for user interface
    this.canShowMore = sourcesToShow < valuesSumSource.length || targetsToShow < targetCount;
    this.messages[0] = (sourcesToShow < valuesSumSource.length)
      ? `${typeOfNode} nodes of total flow ${descending ? '≤' : '≥'} ${dotFormat(valuesSumSource[sourcesToShow].values)}${valuePostFix} are not displayed.`
      : `All ${typeOfNode} nodes are displayed.`;
    this.messages[1] = `${sourcesToShow}/${valuesSumSource.length} ${typeOfNode} nodes shown`;
    if (sourcesToShow === valuesSumSource.length && targetsToShow < targetCount) {
      const otherTypeOfNode = bySource ? 'target' : 'source';
      this.messages[1] += ` (${targetsToShow}/${targetCount} ${otherTypeOfNode} nodes shown)`;
    }

    return this.graphFromNodeFlows(nodes, flows);
  }

  private sumValues(flows: Flow[], node: string, nodeIsSource: boolean) {
    return flows
      .filter((d) => { return node === (nodeIsSource ? d.source : d.target); })
      .map((d) => d.value)
      .reduce((total, current) => total + current);
  }

  private graphFromNodeFlows(nodes: SNode[], flows: Flow[]): any {
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
    const that = this;
    this.$node.on('change', function(d) {
      const sel :any = this;
      that.sortType = sel.options[sel.selectedIndex].value;
      SimpleLogging.log('set sort flows by', that.sortType);
      events.fire(AppConstants.EVENT_SORT_CHANGE, d);
    });

    this.$node2.on('change', function(d) {
      const sel :any = this;
      that.orderType = sel.options[sel.selectedIndex].value;
      SimpleLogging.log('set sort order ', that.orderType);
      events.fire(AppConstants.EVENT_SORT_CHANGE, d);
    });
  }

  // Class is a singleton an therefore only one object can exist => get object with this method
  public static getInstance(parent?: Element, options?: any): FlowSorter {
    if (FlowSorter.instance === null || FlowSorter.instance === undefined) {
      // console.log('flowsorter created with parent ' + parent);
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
