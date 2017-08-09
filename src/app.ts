/**
 * Main entry point of the whole application, where all views are loaded and created.
 *
 * Created by Valid Team on 10.04.2016.
 * Framework Created by Caleydo Team on 31.08.2016.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as plugins from 'phovea_core/src/plugin';
import {HELLO_WORLD} from './language';
import {AppConstants} from './app_constants';

/**
 * Interface for all valid views
 */
export interface MAppViews {
  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<MAppViews>}
   */
  init():Promise<MAppViews>;
}

/**
 * Boilerplate for the views that are loaded
 */
interface MAppViewsDesc {
  /**
   * Consists of the view id, the parent node, and optional options to the view.
   */
  view: string;
  parent: string;
  options: any;
}

/**
 * The main class for the Valid app
 */
export class App implements MAppViews {

  private $node;
    private counter;

  /**
   * Enter here the views you want to append. You can choose between either the
   * 'dataLoadingView' --> Here the file dialog and load for data is placed
   * 'dataVizView' --> This contains the final visualization
   *
   * @type {[{view: string; parent: string; options: {cssClass: string; eventName: string}}]}
   */
  private views:MAppViewsDesc[] = [
    /**
     * {
     *  view: 'ClassNameOfView',
     *  parent: 'Name of parent view',
     *  options: { leave empty if not needed }
     * }
     */
    {
      view: 'ValidHeader',
      parent: 'app',
      options: {},
    },
     {
      view: 'FilterData',
      parent: 'dataVizView',
      options: {}
    },
    {
      view: 'GlobalSettings',
      parent: 'dataVizView',
      options: {}
    },
    {
      view: 'SankeyFeatures',
      parent: 'dataVizView',
      options: {}
    },
    {
      view: 'DataImport',
      parent: 'dataLoadingView',
      options: {},
    },
    {
      view: 'SankeyDetail',
      parent: 'dataVizView',
      options: {},
    },
    {
      view: 'SankeyDiagram',
      parent: 'dataVizView',
      options: {},
    },
    {
      view: 'SparklineBarChart',
      parent: 'dataVizView',
      options: {'parentDOM' : 'div.left_bars', 'field': 'sourceNode'},
    },
    {
      view: 'SparklineBarChartTarget',
      parent: 'dataVizView',
      options: {'parentDOM' : 'div.right_bars', 'field': 'targetNode'},
    }
  ];

  constructor(parent:Element) {
    d3.select('#app').append('div').attr('id', 'validHeader');
    this.$node = d3.select(parent);

    this.$node.append('div').classed('dataLoadingView', true);
    this.$node.append('div').classed('dataVizView', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<App>}
   */
  init() {
    //This method is used to add the event listeners to the view
    this.addListeners();
    //This method calls the build function which fills the DOM with elements
    return this.build();
  }

  /**
   * Initialize all necessary listeners here
   */
  private addListeners() {
    //Add listeners here
    window.addEventListener('resize', () => {
      events.fire(AppConstants.EVENT_RESIZE_WINDOW);
    });
  }

  /**
   * Load and initialize all necessary views
   * @returns {Promise<App>}
   */
  private build() {
       this.setBusy(true); // show loading indicator before loading

    // wrap view ids from package.json as plugin and load the necessary files
    const pluginPromises = this.views
      .map((d) => plugins.get(AppConstants.VIEW, d.view))
      .filter((d) => d !== undefined) // filter views that does not exists
      .map((d) => d.load());

    // when everything is loaded, then create and init the views
    const buildPromise = Promise.all(pluginPromises)
      .then((plugins) => {
        this.$node.select('h3').remove(); // remove loading text from index.html template

        const initPromises = plugins.map((p, index) => {
          const view = p.factory(
            this.$node.select(`.${this.views[index].parent}`).node(), // parent node
            this.views[index].options || {} // options
          );
          return view.init();
        });

        // wait until all views are initialized, before going to next then
        return Promise.all(initPromises);
      })
      .then((viewInstances) => {
        // loading and initialization has finished -> hide loading indicator
        this.setBusy(false);
        return this;
      });

    return buildPromise;
  }

  /**
   * Show or hide the application loading indicator
   * @param isBusy
   */
  setBusy(isBusy: boolean) {
    this.$node.select('.busy').classed('hidden', !isBusy);
  }

}

/**
 * Factory method to create a new app instance
 * @param parent
 * @returns {App}
 */
export function create(parent:Element) {
  return new App(parent);
}
