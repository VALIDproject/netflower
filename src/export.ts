/**
 * Created by rind on 1/30/18.
 */

import * as events from 'phovea_core/src/event';
import * as bootbox from 'bootbox';
import * as d3 from 'd3';
import {AppConstants} from './app_constants';
import {MAppViews} from './app';
import {downloadFile, randomString, initDefaultColumnLabels} from './utilities';
import {EXPORT_INFO, EXPORT_INFO2} from './language';
import SimpleLogging from './simpleLogging';
import EntityTagFilter from './filters/entityTagFilter';
import MediaTagFilter from './filters/mediaTagFilter';

export default class Export implements MAppViews {

  private $node: d3.Selection<any>;
  private parentDOM: string;
  private btnExportFlowData: d3.Selection<any>;
  private checkBoxExport: d3.Selection<any>;
  private exportAll: boolean = true;
  public static entityTagFilterRef: EntityTagFilter;
  public static mediaTagFilterRef: MediaTagFilter;
  public static currentData: any;

  constructor(parent: Element, private options: any) {
    this.parentDOM = options.parentDOM;
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<MAppViews>}
   */
  init(): Promise<MAppViews> {
    this.btnExportFlowData = d3.select('#exportData');
    this.checkBoxExport = d3.select('#exportCheckbox');
    // this.$node = this.btnExportFlowData;

    this.attachListener();

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // Retrieve the log file
    this.btnExportFlowData.on('click', (d) => {
      SimpleLogging.log('export flows clicked', '');
      let dataAsArray = [[]];

      // Check if we should save whole data or only the small sample before we proceed
      this.exportAll = !this.checkBoxExport.property('checked') ? true : false;

      if (this.exportAll) {
        console.log('we export all');
      } else {
        // Column headers (based on input metadata if available)
        let columnLabels: any = JSON.parse(localStorage.getItem('columnLabels'));
        if (columnLabels == null) {
          columnLabels = initDefaultColumnLabels(columnLabels);
        }
        dataAsArray = [[columnLabels.sourceNode, columnLabels.sourceTag,
          columnLabels.targetNode, columnLabels.targetTag, columnLabels.valueNode]];

        // Flows extracted from data properties of the sankey links
        d3.selectAll('#sankeyDiagram path.link').each((d, i) => {
          const sourceHash = Export.entityTagFilterRef
            .getTagsByName(Export.currentData, d.source.name)
            .values().join('|');
          const targetHash = Export.mediaTagFilterRef
            .getTagsByName(Export.currentData, d.target.name)
            .values().join('|');
          dataAsArray.push([d.source.name, sourceHash, d.target.name, targetHash, d.value]);
        });

        // META DATA:
        //----------------------------------------------------------
        // Time points we have available:
        const currentTime = [];
        d3.select('#timeInfoHeader').selectAll('span').each(function (d, i) {
          currentTime.push(d3.select(this).text());
        })
        // Attributes that are set at the moment
        let currentAttrs = [];
        d3.select('#attribute1').selectAll('span').each(function (d, i) {
          currentAttrs.push(d3.select(this).text());
        })
        currentAttrs = currentAttrs.filter(Boolean); // Needed to remove empty strings

        // Add the meta data as the first line of the csv
        dataAsArray.unshift(['Timerange: ' + currentTime.join('|'),
          'Attribute: ' + currentAttrs.join('|')]);
      }

      console.log('data: ', dataAsArray);
      // CSV export using D3.js
      const dataAsStr = d3.csv.format(dataAsArray);
      const filename = 'flows ' + new Date().toLocaleString() + '.csv';
      if (dataAsArray.length === 1) {
        bootbox.alert('No flows are visible.');
      } else {
        bootbox.confirm({
          className: 'dialogBox',
          title: 'Information',
          message: EXPORT_INFO,
          callback(result) {
            if (result) {
              downloadFile(dataAsStr, filename, 'text/csv');
            } else {
              return;
            }
          }
        });
      }
    });
  }

  /**
   * This method exports a single flow over time and saves it into a csv file.
   * @param selector of the element which should be exported
   * @param comment to the exported data
   */
  public static exportSingleFlowOverTime(selector: string, comment: string) {
    // Column headers (based on input metadata if available)
    let columnLabels: any = JSON.parse(localStorage.getItem('columnLabels'));
    if (columnLabels == null) {
      columnLabels = {};
      columnLabels.timeNode = 'time';
      columnLabels.valueNode = 'value';
    }
    const dataAsArray = [[columnLabels.timeNode, columnLabels.valueNode]];

    console.log('selector: ', selector);
    d3.selectAll(selector).each((d, i) => {
      console.log('d: ', d);
      dataAsArray.push([d.timeNode, d.valueNode]);
    });

    // CSV export using D3.js
    let dataAsStr = d3.tsv.format(dataAsArray);
    if (comment.length > 0) {
      dataAsStr = '# ' + comment + '\n' + dataAsStr;
    }
    const filename = 'timeseries ' + new Date().toLocaleString() + '.tsv';
    if (dataAsArray.length === 1) {
      bootbox.alert('No time steps are visible.');
    } else {
      bootbox.confirm({
        className: 'dialogBox',
        title: 'Information',
        message: EXPORT_INFO2,
        callback(result) {
          if (result) {
            downloadFile(dataAsStr, filename, 'text/csv');
          } else {
            return;
          }
        }
      });
    }
  }
}

/**
 * This (dirty) method is used to get the reference of the updated tag filters once the user finished
 * the tagging. Also the current data is stored as we want to read out the tags and associate them to
 * the respective nodes.
 * @param filter1 entity tag filter reference
 * @param filter2 media tag filter reference
 * @param data original data
 */
export function setTagFilterRefs(filter1, filter2, data) {
  Export.entityTagFilterRef = filter1;
  Export.mediaTagFilterRef = filter2;
  Export.currentData = data;
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
