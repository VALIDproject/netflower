/**
 * Created by Florian on 25.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as papaparse from 'papaparse';
import * as $ from 'jquery';
import * as localforage from 'localforage';
import * as bootbox from 'bootbox';
import * as alertify from 'alertify.js';
import {textTransition} from './utilities';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import {USAGE_INFO, DOWNLOAD_INFO, DOWNLOAD_DIALOG} from './language';
import SimpleLogging from './simpleLogging';
import time = d3.time;

const keyRep: Array<string> = ['sourceNode', 'targetNode', 'timeNode', 'valueNode', 'attribute1', 'attribute2'];

class DataImport implements MAppViews {

  private $node: d3.Selection<any>;
  private $fileContainer: d3.Selection<any>;
  private $displayContainer: d3.Selection<any>;
  private $chaningHeading: d3.Selection<any>;
  private $helpInfo: d3.Selection<any>;
  private $tableRows: JQuery;
  private $btnNext: JQuery;
  private $btnPrev: JQuery;

  private parseResults;
  private editMode: boolean;

  private uploadedFileName: string;
  private rowsToShow: number = 10;
  private trLength: number;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('dataImport', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<DataImport>}
   */
  init() {
    const dataAvailable = localStorage.getItem('dataLoaded') === 'loaded' ? true : false;

    if(!dataAvailable) {
      d3.select('.dataVizView').classed('invisibleClass', true);
      d3.select('#backBtn').classed('invisibleClass', true);
    } else {
      d3.select('.dataVizView').classed('invisibleClass', false);
      d3.select('#backBtn').classed('invisibleClass', false);
      d3.select('.dataLoadingView').classed('invisibleClass', true);
    }

    alertify.maxLogItems(10);
    this.build();
    this.attachListener();

    // Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements
   */
  private build() {
    // Add the upload form and whole container
    this.$fileContainer = this.$node.html(`
    <div class='fileContainer'>
    <!--<button type='button' id='specialBtn' class='btn btn-primary btn-lg'>Start Visualization</button>-->
    <h3 id='informationText'>Load your data here:</h3>
      <form class='form-inline well'>
        <div class='form-group'>
          <div class='input-group'>
              <span class='input-group-btn' style='padding-right: 2px;'>
                <span class='btn btn-default btn-file'>
                  Select CSV file...
                  <input type='file' id='files' accept='.csv' required />
                </span>
              </span>
            <input readonly='readonly' placeholder='CSV file' class='form-control' id='filename' type='text'>
          </div>
        </div>
        <div class='form-group'>
          <button type='submit' id='submitFile' class='btn btn-primary'>Load & Show</button>
          <button type='button' id='showMoreBtn' class='btn btn-info'>View Data</button>
          <button type='button' id='sampleFile' class='btn btn-primary btn-large'>
            <i class='fa fa-download'></i> Sample Files</button>
        </div>
      </form>`
    );

    // Add the display conatiner and the logs
    d3.select('.fileContainer').append('div').classed('additionalInfo', true);
    this.$displayContainer = d3.select('.additionalInfo').html(`
        <div class='row'>
          <div class='ctrlContainer'>
            <h3 id='valueListName'></h3>
            <div class='btnContainer'>
              <button type='button' id='seePrevRecords' class='btn btn-primary btn-sm'>
                <i class='fa fa-arrow-left'></i></button>
              <button type='button' id='seeNextRecords' class='btn btn-primary btn-sm'>
                <i class='fa fa-arrow-right'></i></button>
            </div>
            <h4 id='valueListMeta'></h4>
          </div>
            <div id='valuesList'></div>
        </div>
    `);

    d3.select('.fileContainer').append('div').classed('helpInfo', true);
    this.$helpInfo = d3.select('.helpInfo').html(`
    <p>${USAGE_INFO}</p>
      <table class='demo'>
        <thead>
        <tr>
          <th>Source</th><th>Target</th><th>Time</th><th>Value</th><th>Attribute 1</th><th>Attribute...</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>Assign an appropriate name for the source nodes of your visualization</td>
          <td>Assign an appropriate name for the target nodes of your visualization</td>
          <td>Assign the time column name here.</td>
          <td>Assign the value column name here. Best to uses is a currency sign.</td>
          <td>Add any attribute name here.</td>
          <td>Further attributes...</td>
        </tr>
        </tbody>
      </table>
      <br/>
    `);

    // Initialize for text transition
    this.$chaningHeading = d3.select('#informationText');

    // Disable some buttons initially
    d3.select('#showMoreBtn').attr('disabled', true).style('opacity', 0);
    this.$btnNext = $('#seeNextRecords').hide();
    this.$btnPrev = $('#seePrevRecords').hide();
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // Listener for the upload button
    this.$node.select('#submitFile')
      .on('click', (e) => {
        SimpleLogging.log('import submit button','');
        alertify.delay(4000).log('Data import started.');

        // Disable the unwanted buttons
        d3.select('#showMoreBtn').attr('disabled', true).style('opacity', 0);
        this.$btnNext = $('#seeNextRecords').hide();
        this.$btnPrev = $('#seePrevRecords').hide();
        // Clear the table if present
        d3.select('.ctrlContainer').classed('invisibleClass', true);
        d3.select('#valuesList').selectAll('*').remove();
        // Change information and reset edit mode
        textTransition(this.$chaningHeading, 'View data, load new or proceed', 500);
        this.editMode = false;

        // Start the uploading
        const filesInput = <HTMLInputElement>d3.select('#files').node();
        this.handleFileUpload(filesInput);

        // Necessary in order to prevent the reload of the page.
        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    // Listener for the Edit Button
    this.$node.select('#showMoreBtn')
      .on('click', (e) => {
        SimpleLogging.log('import preview show button','');
        alertify.delay(4000).log('Viewing the detail table.');
        // Plot the data in the table and enable edit mode
        const resultData = this.parseResults.data;
        this.previewData(resultData);
        this.editMode = true;

        // Get necessary variables for Browsing in the table
        this.$tableRows = $('.valueTable tbody tr');
        this.trLength = this.$tableRows.length;
        this.$tableRows.hide();
        this.$tableRows.slice(0, this.rowsToShow).show();
        this.$btnNext.show();

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    // Listener for the 'Next' Button in the visual browser
    this.$node.select('#seeNextRecords')
      .on('click', (e) => {
        SimpleLogging.log('import preview next button','');
        this.$tableRows.slice(this.rowsToShow - 10, this.rowsToShow).hide();
        this.$tableRows.slice(this.rowsToShow, this.rowsToShow + 10).show();
        this.rowsToShow += 10;
        d3.select('#valueListMeta').html('Viewing page: ' + this.rowsToShow / 10
          + ' of ' + Math.round(this.parseResults.data.length / 10));
        this.checkButtons();

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    // Listener for the 'Prev' Button in the visual browser
    this.$node.select('#seePrevRecords')
      .on('click', (e) => {
        SimpleLogging.log('import preview prev button','');
        this.$tableRows.slice(this.rowsToShow - 10, this.rowsToShow).hide();
        this.rowsToShow -= 10;
        d3.select('#valueListMeta').html('Viewing page: ' + this.rowsToShow / 10
          + ' of ' + Math.round(this.parseResults.data.length / 10));
        this.$tableRows.slice(this.rowsToShow - 10, this.rowsToShow).show();
        this.checkButtons();

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    // Listener for the download file button
    this.$node.select('#sampleFile').on('click', (e) => {
      bootbox.alert({
        title: 'Sample Files',
        message: `${DOWNLOAD_DIALOG}`,
        className: 'alternateBootboxDialog'
      });
      const evt = <MouseEvent>d3.event;
      evt.preventDefault();
      evt.stopPropagation();
    });

    d3.selectAll('a').on('click', (e) => {console.log('testaaaaaaa'); e.preventDefault();});

    // This little trick removes the fakepath form the filepath in the input field.
    $('#files').change(function(){
      $('#filename').val($(this).val().replace('C:\\fakepath\\', ''));
    });
  }

  /**
   * The function is called upon the upload button is clicked and it parses the file further.
   * @param filesInput The file input element
   */
  private handleFileUpload(filesInput: HTMLInputElement) {
    papaparse.parse(filesInput.files[0], {
      header: true,                   // First row of parsed data is interpreted as field name
      skipEmptyLines: true,           // Skips empty lines in .csv
      chunk: (results, file) => {     // Limit is 10MB for files
        this.parseResults = results;
      },
      error(err, file)      // Executes if there is an error loading the file
      {
        const msg = `<small>${new Date().toLocaleString()}</small>:
                     <br/>${err}<br/>File: ${file.name}`;
        alertify.delay(7000).error(msg);
      },
      complete: (res, file) => {      // Needs arrow function in order to pass the this object globally and not the this of papaparse object
        this.uploadedFileName = file.name;
        this.displayData(this.parseResults);

        const msg = `<small>${new Date().toLocaleString()}</small>:
                     <br/>File: ${file.name}<br/><strong>Loaded successfully!</strong>`;
        alertify.delay(5000).success(msg);
        SimpleLogging.log('import upload complete', file.name);

        setTimeout(() => {
          // Before rework the keys of the data
          SimpleLogging.log('import special button','');

          this.reworkKeys(this.parseResults);
          this.reworkNegativeValues(this.parseResults);
          this.makeNodesUnique();

          if(this.editMode) {
            const msg = `You have <strong>ERRORS</strong> in your Table. This would produce a strange behaving
                visualization. You should check the other error messages and clean your data.`;
            alertify.closeLogOnClick(true).delay(0).error(msg);
            console.log('In edit mode');
          } else {
            console.log('Not in edit mode');
            Promise.resolve(this.storeData()).then((res) => {
              console.log('res: ', res);
              events.fire(AppConstants.EVENT_DATA_PARSED, 'parsed');
              d3.select('.dataLoadingView').classed('invisibleClass', true);
              d3.select('.dataVizView').classed('invisibleClass', false);
            });
          }
        }, 4000);
      }
    });
  }

  /**
   * This method lists all eventual errors in the data in the error log and resizes the container for the tabel.
   * @param results The parsed results of the papaparse loader
   */
  private displayData(results) {
    const resultError = results.errors;

    // Resize the table appropriate and add scroll area if necessary
    d3.select('#valuesList')
      .attr('max-width', ($(window).innerWidth() / 2))
      .classed('scrollArea', true);

    // Print out the parse errors in the file
    if (resultError.length > 0) {
      // Enable the detail button and the start visualization button
      d3.select('#showMoreBtn').attr('disabled', null)
        .transition()
        .duration(1250)
        .style('opacity', 1);

      // Don't go to the visualization page
      this.editMode = true;

      for(const el of resultError) {
        const elem = el;
        const msg = `<small>${new Date().toLocaleString()}</small>:
                     <br/><strong>Error:</strong>${elem.message}
                     <br/><strong>Search in Row: </strong> ${elem.row}`;
        alertify.closeLogOnClick(true).delay(0).error(msg);
      }
    }

    // Show a success message
    const msg = `<strong>Success!!</strong> Data is loaded.
                 <br/>Rows-preview: ${this.rowsToShow}
                 <br/>Rows-total: ${this.parseResults.data.length}`;
    setTimeout(function(){
      alertify.delay(5000).log(msg);
    }, 1500);
  }

  /**
   * This function stores the data which was loaded in the localforage and a helper variable in localstorage.
   * Differneces are the asynchronus load of localforage and smaller size of localstorage.
   */
  private storeData() {
    // Store the data
    localforage.setItem('data', this.parseResults.data).then(function (value) {
      console.log('Saved data');
    }).catch(function (err) {
      console.log('Error: ', err);
    });

    // Local Storage for small variables
    localStorage.setItem('dataLoaded', 'loaded');
    localStorage.setItem('fileName', this.uploadedFileName);
    localStorage.setItem('columnLabels', JSON.stringify(this.reworkColumnLabels(this.parseResults.meta.fields)));

    return new Promise((resolve) => {
      resolve('Data storage finished.');
    });
  }

  /**
   * This method saves the original column labels in order to use them later on.
   * @param keys are the values which get saved.
   * @returns {any} object which  contains the saved column names and new names.
   */
  private reworkColumnLabels(keys: string[]): any {
    const result : any = {};
    for (let i = 0; i < keys.length; i++) {
      result[keyRep[i]] = keys[i];
    }
    return result;
  }

  /**
   * This method reowrks the column headings of each table in order to make them unified.
   * @param json the raw data.
   */
  private reworkKeys(json) {
    const data = json.data;
    const keys = Object.keys(data[0]);

    data.forEach(function(e) {
      for(let i = 0; i < keys.length; i++) {
        e[keyRep[i]] = e[keys[i]];
        delete e[keys[i]];
      }
    });
    this.parseResults.data = data;
  }

  /**
   * Ensure that all target node names are different from source node names.
   * In such a case, a whitespace is added.
   */
  private makeNodesUnique() {
    const json = this.parseResults.data;
    //All source nodes
    const sources = d3.set(
      json.map(function (d: any) { return d.sourceNode; })
    );
    //All rows of orig data that have a known source node as target node
    const flowsToChange = json.filter((d) => {return sources.has(d.targetNode); });
    //Transform these rows
    flowsToChange.forEach((d) => {
      d.targetNode = d.targetNode + ' ';
    });
  }

  /**
   * This function is used to remove negative values if there are some in order to display the data
   * appropriately. Furthermore the source and target are flipped in order to represen the change.
   * @param json with the original data
   */
  private reworkNegativeValues(json) {
    const data = json.data;
    data.forEach((o) => {
      if (o.valueNode < 0) {
        [o.sourceNode, o.targetNode] = [o.targetNode, o.sourceNode];
        o.valueNode = (o.valueNode * -1) + '';
      }
    });
    this.parseResults.data = data;
  }

  /**
   * This function creates a html table to view the data from the .csv in a visual browser.
   * The first 10 rows only are shown for a better viusal experience.
   * @param resultData
   */
  private previewData(resultData) {
    console.log(this.parseResults.data.length);
    d3.select('.ctrlContainer').classed('invisibleClass', false);
    d3.select('#valueListName').html('Name: ' + this.uploadedFileName);
    d3.select('#valueListMeta').html('Viewing page: ' + this.rowsToShow / 10
      + ' of ' + Math.round(this.parseResults.data.length / 10));

    let table = `<table class='table valueTable' >`;
    //Create the header of the table
    table += '<thead>';
    for (const k in resultData[0] ) {
      if(resultData[0].hasOwnProperty(k)) {
        table += '<th>' + k + '</th>';
      }
    }
    table += '</thead>';

    for(const el of resultData) {
      const row = el;
      table += '<tr>';
      for (const key in row) {
        if(row.hasOwnProperty(key)) {
          table += '<td> ' + row[key] + '</td>';
        }
      }
      table += '</tr>';
    }
    table += '</table>';
    $('#valuesList').html(table);
  }

  /**
   * This function checks whether the left or right buttons for browsing the table should be shown or not.
   */
  private checkButtons() {
    if (this.rowsToShow >= this.trLength) {
      this.$btnNext.hide();
    } else {
      this.$btnPrev.show();
    }

    if (this.rowsToShow > 10) {
      this.$btnPrev.show();
    } else {
      this.$btnPrev.hide();
    }

    if(this.rowsToShow === 10) {
      this.$btnNext.show();
      this.$btnPrev.hide();
    }
  }
}

/**
 * Factory method to create a new DataImport instance
 * @param parent
 * @param options
 * @returns {DataImport}
 */
export function create(parent: Element, options: any) {
  return new DataImport(parent, options);
}
