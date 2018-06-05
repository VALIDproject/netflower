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

  static EVENT_FILTER_DEACTIVATE_TAG_FLOW_FILTER = 'eventFilterDeactiveTagFlowFilter';

  static EVENT_SLIDER_CHANGE = 'eventSliderChange';

  static EVENT_UI_COMPLETE = 'eventUIComplete';

  static EVENT_CLEAR_FILTERS = 'eventClearFilters';

  static EVENT_TIME_VALUES = 'eventTimeValues';

  static EVENT_SORT_CHANGE = 'eventSortChange';

  static EVENT_SANKEY_SORT_BEHAVIOR = 'eventSankeySortBehavior';

  static SANKEY_TOP_MARGIN = 10;
  static SANKEY_NODE_PADDING = 20;

  // FILE DOWNLOADS
  static ASYLUM_FILE = 'https://dl.dropboxusercontent.com/s/cr3iu0adtb77de6/Asylum_Seekers_Data.csv?dl=0';
  static FARM_FILE = 'https://dl.dropboxusercontent.com/s/zunih3hkcooh1gm/Farm_Subsidies_Data.csv?dl=0';
  static MEDIA_FILE = 'https://dl.dropboxusercontent.com/s/34ev5sr6u3xdisq/Media_Transperency_Data.csv?dl=0';
  static FILE4 = 'https://dl.dropboxusercontent.com/s/k4dhuh7hnmoclzf/Simple_Data.csv?dl=0';
  static OECD_FILE = 'https://dl.dropboxusercontent.com/s/cvigz33c3g8h5be/Aid_Payments_OECD.csv?dl=0';
}
