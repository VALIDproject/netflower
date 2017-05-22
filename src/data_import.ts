/**
 * Created by Florian on 25.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as papaparse from 'papaparse';
import * as $ from 'jquery';
import * as localforage from 'localforage'
import {tableToJSON} from './utilities';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';

class DataImport implements MAppViews {

  private $node: d3.Selection<any>;
  private $fileContainer: d3.Selection<any>;
  private $displayContainer: d3.Selection<any>;
  private $chaningHeading: d3.Selection<any>;
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
    let dataAvailable = localStorage.getItem('dataLoaded') == 'loaded' ? true : false;

    if(!dataAvailable) {
      d3.select('.dataVizView').classed('invisibleClass', true);
    } else {
      d3.select('.dataVizView').classed('invisibleClass', false);
      d3.select('.dataLoadingView').classed('invisibleClass', true);
    }

    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    //Add the upload form and whole container
    this.$fileContainer = this.$node.html(`
    <div class='fileContainer'>
    <button type='button' id='specialBtn' class='btn btn-primary btn-lg'>Start Visualization</button>
    <center><h2 id='informationText'>Upload your data here!!</h2></center>
      <form class='form-inline well'>
        <div class='form-group'>
          <label for='files'>Upload a CSV file:</label>
          <input type='file' id='files' class='form-control' accept='.csv' required />
        </div>
        <div class='form-group'>
          <button type='submit' id='submitFile' class='btn btn-primary'>
            <i class='fa fa-upload'>&nbsp;</i>Upload File</button>
          <button type='button' id='showMoreBtn' class='btn btn-info'>
            <i class='fa fa-pencil-square-o'>&nbsp;</i>View Data</button>
        </div>
      </form>`);

    //Add the display conatiner and the logs
    d3.select('.fileContainer').append('div').classed('additionalInfo', true);
    this.$displayContainer = d3.select('.additionalInfo').html(`
        <div class='logContainer'>
          <div id='errorLog'></div>
          <div id='messageLog'></div>
        </div>
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
			</div>
    `);

    //Initialize for text transition
    this.$chaningHeading = d3.select('#informationText');

    //Disable some buttons initially
    d3.select('#specialBtn').attr('disabled', true).style('opacity', 0);
    d3.select('#showMoreBtn').attr('disabled', true).style('opacity', 0);
    this.$btnNext = $('#seeNextRecords').hide();
    this.$btnPrev = $('#seePrevRecords').hide();
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    //Listener for the upload button
    this.$node.select('#submitFile')
      .on('click', (e) => {
        //Clear the log first
        d3.select('#errorLog').selectAll('*').remove();
        d3.select('#messageLog').html('');

        //Then disable the unwanted buttons
        d3.select('#specialBtn').attr('disabled', true).style('opacity', 0);
        d3.select('#showMoreBtn').attr('disabled', true).style('opacity', 0);
        this.$btnNext = $('#seeNextRecords').hide();
        this.$btnPrev = $('#seePrevRecords').hide();

        //Clear the table if present
        d3.select('.ctrlContainer').classed('invisibleClass', true);
        d3.select('#valuesList').selectAll('*').remove();

        //Change information and reset edit mode
        this.textTransition(this.$chaningHeading, 'View data, upload new or proceed!!');
        this.editMode = false;

        //Start the uploading
        const filesInput = <HTMLInputElement>d3.select('#files').node();
        this.handleFileUpload(filesInput);

        //Necessary in order to prevent the reload of the page.
        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    //Listener for the Edit Button
    this.$node.select('#showMoreBtn')
      .on('click', (e) => {
        //Plot the data in the table and enable edit mode
        let resultData = this.parseResults.data;
        this.previewData(resultData);
        this.editMode = true;

        //Get necessary variables for Browsing in the table
        this.$tableRows = $('.valueTable tbody tr');
        this.trLength = this.$tableRows.length;
        this.$tableRows.hide();
        this.$tableRows.slice(0, this.rowsToShow).show();
        this.$btnNext.show();

        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    //Listener for the 'Next' Button in the visual browser
    this.$node.select('#seeNextRecords')
      .on('click', (e) => {
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

    //Listener for the 'Prev' Button in the visual browser
    this.$node.select('#seePrevRecords')
      .on('click', (e) => {
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

    //Listener for the finished visualization Button
    this.$node.select('#specialBtn')
      .on('click', (e) => {
        if(this.editMode) {
          d3.select('.dataLoadingView').classed('invisibleClass', true);
          d3.select('.dataVizView').classed('invisibleClass', false);
          d3.select('#valuesList').selectAll('*').remove();

          this.storeData();

          events.fire(AppConstants.EVENT_DATA_PARSED, this.parseResults.data);
          console.log('In edit mode');
        } else {
          d3.select('.dataLoadingView').classed('invisibleClass', true);
          d3.select('.dataVizView').classed('invisibleClass', false);

          this.storeData();

          events.fire(AppConstants.EVENT_DATA_PARSED, this.parseResults.data);
          console.log('Not in edit mode');
        }
        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });
  }

  /**
   * The function is called upon the upload button is clicked and it parses the file further.
   * @param filesInput The file input element
   */
  private handleFileUpload(filesInput: HTMLInputElement) {
    papaparse.parse(filesInput.files[0], {
      header: true,                   //First row of parsed data is interpreted as field name
      skipEmptyLines: true,           //Skips empty lines in .csv
      chunk: (results, file) => {     //Limit is 10MB for files
        this.parseResults = results;
      },
      error: function(err, file)      //Executes if there is an error loading the file
      {
        d3.select('#errorLog').append('p')
          .text(new Date().toLocaleTimeString() + ' --- ' + err + ' :: ' + file);
      },
      complete: (res, file) => {      //Needs arrow function in order to pass the this object globally and not the this of papaparse object
        this.uploadedFileName = file.name;
        this.displayData(this.parseResults);

        //Enable the detail button and the start visualization button
        d3.select('#showMoreBtn').attr('disabled', null)
          .transition()
          .duration(1250)
          .style('opacity', 1);

        d3.select('#specialBtn').attr('disabled', null)
          .transition()
          .duration(1250)
          .style('opacity', 1);
      }
    });
  }

  /**
   * This method lists all eventual errors in the data in the error log and resizes the container for the tabel.
   * @param results The parsed results of the papaparse loader
   */
  private displayData(results) {
    let resultError = results.errors;

    //Resize the table appropriate and add scroll area if necessary
    d3.select('#valuesList')
      .attr('max-width', ($(window).innerWidth() / 2))
      .classed('scrollArea', true);

    //Print out the parse errors in the file
    if (resultError.length > 0) {
      for (let i = 0; i < resultError.length; i++) {
        let elem = resultError[i];
        d3.select('#errorLog').append('p')
          .html('Date: ' + new Date().toLocaleTimeString() + '<br/>'
            + 'Error: ' + elem.message + '<br/>' + ' Search in Row: ' + elem.row);
      }
    }
    //Show a success message
    // d3.select('#messageLog').html('Date: ' + new Date().toLocaleTimeString()
    //   + ' --- Success!! Data is loaded.');
    // d3.select('#messageLog').html('Rows-preview: ' + this.rowsToShow +'<br/>'
    //   + 'Rows-total: ' + this.parseResults.data.length);
  }

  /**
   * This function stores the data which was loaded in the localforage and a helper variable in localstorage.
   * Differneces are the asynchronus load of localforage and smaller size of localstorage.
   */
  private storeData() {
    //Store the data
    localforage.setItem('data', this.parseResults.data).then(function (value) {
      console.log('Saved data');
    }).catch(function (err) {
      console.log('Error: ', err);
    })

    //Local Storage for small variables
    localStorage.setItem('dataLoaded', 'loaded');
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
    for (var k in resultData[0] ) {
      table += '<th>' + k + '</th>';
    }
    table += '</thead>';

    for (let i = 0; i < resultData.length; i++) {
      let row = resultData[i];
      table += '<tr>';
      for (let key in row) {
        table += '<td> ' + row[key] + '</td>';
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

    if(this.rowsToShow == 10) {
      this.$btnNext.show();
      this.$btnPrev.hide();
    }
  }

  /**
   * This function fades in a text or fades over a text on a given html element
   * @param element html to fade the text onto
   * @param newText the text to show in the html elment
   */
  private textTransition(element: d3.Selection<any>, newText: string) {
    element.transition().duration(500)
      .style('opacity', 0)
      .transition().duration(500)
      .style('opacity', 1)
      .text(newText);
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
