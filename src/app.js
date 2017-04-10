/**
 * Created by Caleydo Team on 31.08.2016.
 */
import * as d3 from 'd3';
import { HELLO_WORLD } from './language';
/**
 * The main class for the App app
 */
var App = (function () {
    function App(parent) {
        this.$node = d3.select(parent);
    }
    /**
     * Initialize the view and return a promise
     * that is resolved as soon the view is completely initialized.
     * @returns {Promise<App>}
     */
    App.prototype.init = function () {
        return this.build();
    };
    /**
     * Load and initialize all necessary views
     * @returns {Promise<App>}
     */
    App.prototype.build = function () {
        this.$node.html(HELLO_WORLD);
        return Promise.resolve(null);
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