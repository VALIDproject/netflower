/**
 * Created by rind on 9/19/17.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import { AppConstants } from './app_constants';
import { MAppViews } from './app';

export default class HelpWindow implements MAppViews {

  // for the UI (= button)
  private $node: d3.Selection<any>;
  private parentDOM: string;
  private htmlString: string;

  constructor(parent: Element, private options: any) {
    this.parentDOM = options.parentDOM;
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<MAppViews>}
   */
  init(): Promise<MAppViews> {
    this.$node = d3.select(this.parentDOM).append('p');

    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }

  /**
   * Build the basic DOM elements
   * a href='https://twitter.com/valid_at' target ='blank'><i class='fa fa-twitter-square fa-2x' id='web' ></i></a>
   */
  private build() {
    this.$node.append('a')
      .attr('id', 'helpTextBtn')
      .append('i')
      .attr('class','fa fa-question fa-2x')
      .attr('style', 'cursor: pointer;');

  }
  /**
   * Attach the event listeners
   */
  private attachListener() {
    d3.select('#helpTextBtn').on('click', (e) => {
      // Open the HTML tags first and the basic stuff;
      this.htmlString = `<html><head>
                            <title>Help Site</title>
                            <style>${this.customStyle()}</style>
                         </head><body>`;

      // Add the custom HTML now
      this.htmlString += this.customHtml();

      // Close the HTML tags again
      this.htmlString += `
      <script>${this.customJs()}</script>
      </body></html>
      `;

      console.log('string: ', this.htmlString);

      // Open the new Tab with the page we generated
      let newwindow = window.open();
      let newdocument = newwindow.document;
      newdocument.write(this.htmlString);
      newdocument.close();
    });
  }

  /**
   * This function is used in order to define the styles for the custom html site.
   * @returns {string} of the styles
   */
  private customStyle(): string {
    return `
    body {
      font-family: Yantramanav, 'Helvetica Neue', Helvetica, sans-serif;
      font-weight: 400;
      padding:10px;
    }

    .logo {
        float: left;
        background-repeat: no-repeat;      
        margin-right:20px;
        font-size: 150%;
        font-family: 'Oswald', sans-serif;
      }         
      
      #validHeader {
        //position: fixed;      
        width: 100%;
        height: 35px;
        background-color: #f0f0f0;
        padding: 10px;
        display: block;
        border-bottom: 2px solid #dddddd;
      }
      .screen img{
        width: 800px; 
        border: 1px solid grey;
        
      }

      #content {
        display:none;
      }
    `;
  }

  private customJs(): string {
    return `
      const i = 2;
      console.log('Wert von i: ', i);
    `;
  }

  /**
   * This function is used to define the html body of the custom html site.
   * @returns {string} the whole html body of the site.
   */
  private customHtml(): string {
    return `
  
      <div id='validHeader'>
      <div class='logo'>NETFLOWER - Introductional Material & Tutorials</div>           
      </div>
      <p>Dear user, this is the help site of netflower. You find tutorial videos and help materials in the form of screenshots and textual descriptions here.
      Please select first if you like to watch videos or use screenshots and textual elements to get help.</p>
      <button type="button">Screens & Text</button>
      <button type="button">Videos</button>

      <div>
      <h2>Table of Content:</h2>
      <p><a href="#loaddata">How to load data:</a></p>
      <p><a href="#readviz">How to read the visulization:</a></p>
      <p><a href="#filter">How to filter, sort and order:</a></p>
      <p><a href="#notebook">How to use the notebook:</a></p>
      </div>
      </br>

      <!--Content-->
      <div id ='content'>
      <h3 id="loaddata">How to load data:</h3>   
      <div class="container-fluid">
    	<div class="row">
	  	<div class="col-md-12">
			<div class="row">
        <div class="col-md-8">
        <span class = 'screen'>
        <img src = 'https://www.dropbox.com/s/kqw2z6ndh7uw2gl/load_data_marks.png?raw=1'/>
        </span>
				</div>
				<div class="col-md-4">
					<p>
          This tool requires a specific format for the tables in order to visualize them appropriate. 
          Also <strong>.CSV</strong> are only accepted. If the required format isn't met, it will result in erros or no displayed data. 
          The format of the table headings defines all further views but needs to be in a specific order.</p>
          <p> (1) prepare your data file as a .csv file with the structure shown in the table </br>
          (2) Load you data here and click "Load & Show" </br>
          (3) Here you can download some sample files. </p>					
				</div>
			</div>
		</div>
  </div>
  
  <h3 id="readviz">How to read the visulization:</h3>  

  <div class="container-fluid">
    	<div class="row">
	  	<div class="col-md-12">
			<div class="row">
        <div class="col-md-8">
        <span class = 'screen'>
        <img src = 'https://www.dropbox.com/s/z26ahjx9g6nqsmu/vis_marks.png?raw=1'/>              
        </span>
      
				</div>
				<div class="col-md-4">
					<p>
        (1) The main visualization is a sankey diagram. You read the sankey diagram from left to right. 
         In this example you see the number of Asylm seekers which make an application. The left side are the original countries
         and on the right there are the destination countries.</p>  
        <img style='width: 400px' src = 'https://www.dropbox.com/s/gwnl46zrjllrpob/encoding.png?raw=1'/>
        <p>The screen above shows the visual encoding. There is this example table of asylmn data. The lines from the table to the sankey diagram
        shows the encoding from the data to the visual element - in this case a sankey diagram. </p>
         
        <p>(2) The small bar charts left and right show the amount of asylum applications from the original country and destination country point of 
        view. </p>

        <img style='width: 400px'src = 'https://www.dropbox.com/s/gnn8vd483z6iyi8/detailview.png?raw=1'/>
        <p>By clicking on one connection line in the sankey diagram, you get a detail view showing the amount of asylm applications between 
        the two nodes (origin countries and destination countries).</p>
				</div>
			</div>
		</div>
  </div>

  <h3 id="filter">How to filter, sort and order:</h3>  
    <div class="container-fluid">
    	<div class="row">
	  	<div class="col-md-12">
			<div class="row">
        <div class="col-md-8">
        <span class = 'screen'>
        <img src = 'https://www.dropbox.com/s/pgpvtm7n6icel59/filter_marks2.png?raw=1'/>
        </span>
				</div>
				<div class="col-md-4">
        <p>You can filter, sort and order the data, which influences the visualization view. </br>
        1) You can filter the data in time and connection. </br>
        2) You can sort the data by source, target and flow and order it ascending and decending. </br>
        3) Export the data from the current view. You get a .csv file with the data of the current visualization, including all sorting and
        filtering operations.</br>
        4) You can limit the number of aslymn applications by using the slider on both sides. </br>
        5) Search for a particular country in the origin and also in the destination countries using the seach box. </p>
				</div>
			</div>
		</div>
  </div>


  <h3 id="notebook">How to use the notebook:</h3>  
    <div class="container-fluid">
    	<div class="row">
	  	<div class="col-md-12">
			<div class="row">
        <div class="col-md-8">
        <span class = 'screen'>
        <img src = 'https://www.dropbox.com/s/ejf85l057deiw30/notebook.png?raw=1'/>
        </span>
				</div>
				<div class="col-md-4">
        <p>You can use a notebook, which opens when clicking the handler on the left side of the screen. 
        You can add some notes and also export it as a .txt. file. Please notice, that if you close your browser and shut down your device, the 
        data get lost.</p>
				</div>
			</div>
		</div>
  </div>
  </div>    
</div>

    `;
  }

}

/**
 * Factory method to create a new SimpleLogging instance
 * @param parent
 * @param options
 * @returns {SparklineBarChart}
 */
export function create(parent: Element, options: any) {
  return new HelpWindow(parent, options);
}
