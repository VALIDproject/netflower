/**
 * Created by rind on 1/30/18.
 */

import * as events from 'phovea_core/src/event';
import * as bootbox from 'bootbox';
import * as d3 from 'd3';
import { AppConstants } from './app_constants';
import { MAppViews } from './app';
import { downloadFile, randomString } from './utilities';
import SimpleLogging from './simpleLogging';

export default class Export implements MAppViews {

  // for the UI (= button)
  private $node: d3.Selection<any>;
  private parentDOM: string;

  private btnExportFlowData: d3.Selection<any>;

  constructor(parent: Element, private options: any) {
    this.parentDOM = options.parentDOM;
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<MAppViews>}
   */
  init(): Promise<MAppViews> {

    this.btnExportFlowData = d3.select(this.parentDOM)
      .append('button')
      .attr('type', 'button')
      .attr('id', 'exportData')
      .attr('class', 'btn btn-primary btn-sm')
      .style('margin-top', '10px')
      .style('display', 'block')
      .text('Export Flows');

    this.$node = this.btnExportFlowData;

    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // retrieve the log file
    this.btnExportFlowData.on('click', (d) => {
      SimpleLogging.log('export flows clicked', '');

      // column headers (based on input metadata if available)
      let columnLabels: any = JSON.parse(localStorage.getItem('columnLabels'));
      if (columnLabels == null) {
        columnLabels = {};
        columnLabels.sourceNode = 'source';
        columnLabels.targetNode = 'target';
        columnLabels.valueNode = 'values';
      }
      const dataAsArray = [[columnLabels.sourceNode, columnLabels.targetNode, columnLabels.valueNode]];

      // flows extracted from data properties of the sankey links
      d3.selectAll('#sankeyDiagram path.link').each((d, i) => {
        dataAsArray.push([d.source.name, d.target.name, d.value]);
      });

      // CSV export using D3.js
      const dataAsStr = d3.csv.format(dataAsArray);
      const filename = 'flows.csv';
      if (dataAsArray.length === 1) {
        bootbox.alert('No flows are visible.');
      } else {
        downloadFile(dataAsStr, filename, 'text/csv');
      }
    });
  }
}

/**
 * Factory method to create a new SimpleLogging instance
 * @param parent
 * @param options
 * @returns {SparklineBarChart}
 */
export function create(parent: Element, options: any) {
  return new Export(parent, options);
}
