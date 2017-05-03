/**
 * Created by Florian on 25.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as papaparse from 'papaparse';
import * as $ from 'jquery';
// import 'imports-loader?d3=d3!../lib/sankey.js';
import {tableToJSON} from './utilities';
import {MAppViews} from './app';

//TODO (F & N): Fire event while file is loading that enables the busy view.
//TODO (C): How to add a sankey:
//           * Add import statement:      import 'imports-loader?d3=d3!../lib/sankey.js';
//           * Initialize object e.g.     const sankey = (<any>d3).sankey();

class DataImport implements MAppViews {

  private $node: d3.Selection<any>;
  private $dropZoneCont: d3.Selection<any>;
  private $chaningHeading: d3.Selection<any>;

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
    d3.select('.dataVizView').classed('invisibleClass', true);

    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    this.$dropZoneCont = this.$node.html(`
    <div class='fileContainer'>
    <button type='button' id='specialBtn' class='btn btn-primary btn-lg'>Start Visualization</button>
    <center><h2 id='informationText'>1st: Upload your data here!!</h2></center>
      <form class='form-inline well'>
        <div class='form-group'>
          <label for='files'>Upload a CSV file:</label>
          <input type='file' id='files' class='form-control' accept='.csv' required />
        </div>
        <div class='form-group'>
          <button type='submit' id='submit-file' class='btn btn-primary'>Upload File</button>
        </div>
      </form>
      <div id='additionalInfo'>
        <div class='logContainer'>
          <div id='errorLog'></div>
          <div id='messageLog'></div>
        </div>
        <div class="row">
            <div class="row" id="valuesList">
        </div>
			</div>
    </div>
    `);

    //Initialize for text transition
    this.$chaningHeading = d3.select('#informationText');

    //Disable the proceed button initially
    d3.select('#specialBtn').attr('disabled', true).style('opacity', 0);
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    this.$node.select('#submit-file')
      .on('click', (e) => {
        //Clear the log first and disable the button
        d3.select('#errorLog').selectAll('*').remove();
        d3.select('#messageLog').html('');
        d3.select('#specialBtn').attr('disabled', true).style('opacity', 0);

        //Change information
        this.textTransition(this.$chaningHeading, '2nd: Change data, upload new or proceed!!');

        const filesInput = <HTMLInputElement>d3.select('#files').node();
        this.handleFileUpload(filesInput);

        //Necessary in order to prevent the reload of the page.
        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });

    this.$node.select('#specialBtn')
      .on('click', (e) => {
        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });
  }

  /**
   * The functino is called upon the upload button is clicked and it parses the file further.
   * @param filesInput The file input element
   */
  private handleFileUpload(filesInput) {
    papaparse.parse(filesInput.files[0], {
      header: true,   //First row of parsed data is interpreted as field name
      skipEmptyLines: true,   //Skips empty lines in .csv
      complete: this.displayData,     //Exceutes once data is loaded
      error: function(err, file)    //Executes if there is an error loading the file
			{
			  d3.select('#errorLog').append('p')
          .text(new Date().toLocaleTimeString() + ' --- ' + err + ' :: ' + file);
			},
      // step: this.displayData
    });
  }

  /**
   * This method displays the results in the table and enables further investigation as well as
   * passing the data to the visualization view.
   * @param results
   */
  private displayData(results) {

    //Resize the table appropriate and add scroll area if necessary
    d3.select('#valuesList')
      .attr('max-width', ($(window).innerWidth() / 2))
      .classed('scrollArea', true);

    if (results.errors.length > 0) {
      for (let i = 0; i < results.errors.length; i++) {
        let elem = results.errors[i];
          d3.select('#errorLog').append('p')
            .html('Date: ' + new Date().toLocaleTimeString() + '<br/>'
              + 'Error: ' + elem.message + '<br/>' + ' Search in Row: ' + elem.row);
      }
    }

		let table = `<table class='table valueTable' >`;
		let data = results.data;

    //Create the header of the table
		table += '<thead>';
		for (var k in results.data[0] ) {
      table += '<th>' + k + '</th>';
    }
    table += '</thead>';

		for (let i = 0; i < data.length; i++) {
      let row = data[i];

      table += '<tr>';
		  for (let key in row) {
        table += '<td contenteditable>' + row[key] + '</td>';
      }
      table += '</tr>';
		}
		table += '</table>';
		$('#valuesList').html(table);

		//Show a success message
		d3.select('#messageLog').html('Date: ' + new Date().toLocaleTimeString()
      + ' --- Success!! Data is loaded.');

		//Finally enable the button
    d3.select('#specialBtn').attr('disabled', null)
      .transition()
      .duration(1250)
      .style('opacity', 1);
  }

  private textTransition(element, newText) {
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
