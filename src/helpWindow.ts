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
      this.htmlString += `</body></html>`;

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
      .example {
        background-color: pink;
      }
    `;
  }

  /**
   * This function is used to define the html body of the custom html site.
   * @returns {string} the whole html body of the site.
   */
  private customHtml(): string {
    return `
      <h1 class='example'>HELLO FRAU STOIBER!</h1>
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
