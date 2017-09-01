/**
 * Created by Florian on 12.04.2017.
 */

/**
 * This class is used to define all constants across the application. Use it for
 * event tags or constant names, that shouldn't change across the whole system.
 */
export class AppConstants {

  static VIEW = 'validView';

  static EVENT_RESIZE_WINDOW = 'resizeWindow';

  static EVENT_DATA_PARSED = 'eventDataParsed';

  static EVENT_CLICKED_PATH = 'eventClickPath';

  static EVENT_CLOSE_DETAIL_SANKEY = 'closeSankeyDetails';

  static EVENT_FILTER_CHANGED = 'eventFilterChanged';

  static EVENT_FILTER_DEACTIVATE_TOP_FILTER = 'eventFilterDeactivateTopFilter';

  static EVENT_SLIDER_CHANGE = 'eventSliderChange';

  static EVENT_UI_COMPLETE = 'eventUIComplete';

  static EVENT_CLEAR_FILTERS = 'eventClearFilters';
}
