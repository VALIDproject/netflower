/**
 * Main entry point of the whole application, where all views are loaded and created.
 *
 * Created by Valid Team on 10.04.2016.
 * Framework Created by Caleydo Team on 31.08.2016.
 */
import * as d3 from 'd3';
import * as plugins from 'phovea_core/src/plugin';
/**
 * The main class for the Valid app
 */
var App = (function () {
    function App(parent) {
        /**
         * Enter here the views you want to append. You can choose between either the
         * 'dataLoadingView' --> Here the file dialog and load for data is placed
         * 'dataVizView' --> This contains the final visualization
         *
         * @type {[{view: string; parent: string; options: {cssClass: string; eventName: string}}]}
         */
        this.views = [
            {
                view: 'sankey',
                parent: 'dataVizView',
                options: {}
            }
        ];
        this.$node = d3.select(parent);
        this.$node.append('div').classed('dataLoadingView', true);
        this.$node.append('div').classed('dataVizView', true);
    }
    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<App>}
     */
    App.prototype.init = function () {
        //This method is used to add the event listeners to the view
        this.addListeners();
        //This method calls the build function which fills the DOM with elements
        return this.build();
    };
    /**
     * Initialize all necessary listeners here
     */
    App.prototype.addListeners = function () {
        //Add listeners here
    };
    /**
     * Load and initialize all necessary views
     * @returns {Promise<App>}
     */
    App.prototype.build = function () {
        var _this = this;
        this.setBusy(true); // show loading indicator before loading
        // wrap view ids from package.json as plugin and load the necessary files
        var pluginPromises = this.views
            .map(function (d) { return plugins.get('validView', d.view); })
            .filter(function (d) { return d !== undefined; }) // filter views that does not exists
            .map(function (d) { return d.load(); });
        // when everything is loaded, then create and init the views
        var buildPromise = Promise.all(pluginPromises)
            .then(function (plugins) {
            _this.$node.select('h3').remove(); // remove loading text from index.html template
            var initPromises = plugins.map(function (p, index) {
                var view = p.factory(_this.$node.select("." + _this.views[index].parent).node(), // parent node
                _this.views[index].options || {} // options
                );
                return view.init();
            });
            // wait until all views are initialized, before going to next then
            return Promise.all(initPromises);
        })
            .then(function (viewInstances) {
            // loading and initialization has finished -> hide loading indicator
            _this.setBusy(false);
            return _this;
        });
        return buildPromise;
    };
    /**
     * Show or hide the application loading indicator
     * @param isBusy
     */
    App.prototype.setBusy = function (isBusy) {
        this.$node.select('.busy').classed('hidden', !isBusy);
    };
    return App;
}());
export { App };
/**
 * Factory method to create a new app instance
 * @param parent
 * @returns {App}
 */
export function create(parent) {
    return new App(parent);
}
//# sourceMappingURL=app.js.map