/**
 * Created by Florian on 25.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as papaparse from 'papaparse';
import * as $ from 'jquery';
import 'imports-loader?d3=d3!../lib/sankey.js';
import {MAppViews} from './app';

//TODO (F & N): Fire event while file is loading that enables the busy view.
//TODO (C): How to add a sankey:
//           * Add import statement:      import 'imports-loader?d3=d3!../lib/sankey.js';
//           * Initialize object e.g.     const sankey = (<any>d3).sankey();

class DataImport implements MAppViews {

  private $node: d3.Selection<any>;
  private $dropZoneCont: d3.Selection<any>;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('data_import', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<DataImport>}
   */
  init() {
    //d3.select('.dataVizView').classed('invisibleClass', true);
    d3.select('.dataLoadingView').classed('invisibleClass', true);

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
    <center><h1>Upload your data here!!</h1></center>
      <form class='form-inline well'>
        <div class='form-group'>
          <label for='files'>Upload a CSV file:</label>
          <input type='file' id='files' class='form-control' accept='.csv' required />
        </div>
        <div class='form-group'>
          <button type='submit' id='submit-file' class='btn btn-primary'>Upload File</button>
        </div>
      </form>
      <div class="row"
			    <div class="row" id="valuesList">
			</div>
    </div>
    `);

  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    this.$node.select('#submit-file')
      .on('click', (e) => {
        const filesInput = <HTMLInputElement>d3.select('#files').node();
        this.handleFileUpload(filesInput)

        //Necessary in order to prevent the reload of the page.
        const evt = <MouseEvent>d3.event;
        evt.preventDefault();
        evt.stopPropagation();
      });
  }

  private handleFileUpload(filesInput) {
    papaparse.parse(filesInput.files[0], {
      header: true,   //First row of parsed data is interpreted as field name
      skipEmptyLines: true,   //Skips empty lines in .csv
      complete: this.displayData,     //Exceutes once data is loaded
      error: function(err, file)    //Executes if there is an error loading the file
			{
				console.log("ERROR:", err, file);
			},
      // step: this.displayData
    });
  }

  private displayData(results) {
    //Resize the table appropriate and add scroll area if necessary
    d3.select('#valuesList')
      .attr('max-width', ($(window).innerWidth() / 2))
      .classed('scrollArea', true);

		let table = `<table class='table'>`;
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
        table += '<td>' + row[key] + '</td>';
      }
      table += '</tr>';
		}
		table += '</table>';
		$("#valuesList").html(table);
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
