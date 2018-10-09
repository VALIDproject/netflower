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
  static SAMPLES = [
    { title: 'Media Transparency',
      description: 'Flows of advertisement and sponsoring money from Austrian government entities to media institutions, which are collectively published as open government data on media transparency (coverage: 2017 Q3-2018 Q2).',
      file: 'https://www.dropbox.com/s/rrtpndumgd8aqrt/Media_Transparency_Data_2018Q2%20tags.csv?dl=0',
      source: 'https://www.rtr.at/de/m/Medientransparenz'},
    { title: 'Asylum Seekers',
      description: 'The data presents information about asylum applications lodged in 38 European and 6 non-European countries. Data are broken down by month and origin.',
      file: 'https://dl.dropboxusercontent.com/s/cr3iu0adtb77de6/Asylum_Seekers_Data.csv?dl=0',
      source: 'http://popstats.unhcr.org/en/overview'},
    { title: 'Farm Subsidies',
      description: 'Aggregated data from farm subsidy payments to reveal flows from different subsidy schemes to locations (sum of recipients).',
      file: 'https://dl.dropboxusercontent.com/s/zunih3hkcooh1gm/Farm_Subsidies_Data.csv?dl=0',
      source: 'https://www.ama.at/Fachliche-Informationen/Transparenzdatenbank'},
    { title: 'Official Development Assistance',
      description: 'ODA commitments by EU countries plus selected other countries and foundations to recipient countries in Afrika, Asia, and Europe; constant prices 2016; coverage 2008-2017 (incomplete).',
      file: 'https://www.dropbox.com/s/t5s7nufwtewg9tv/oecd_development_assistance.csv?dl=0',
      source: 'https://doi.org/10.1787/data-00068-en'},
    { title: 'Aid payments OECD (old)',
      description: 'Aid payments from EU countries to developing countries in the last 10 years.',
      file: 'https://dl.dropboxusercontent.com/s/cvigz33c3g8h5be/Aid_Payments_OECD.csv?dl=0',
      source: 'http://dx.doi.org/10.1787/data-00072-en'},
    // { title: '',
    //   description: '',
    //   file: '',
    //   source: ''},
    { title: 'Simple Example',
      description: 'A simple example file with only a few entries. Great as a template for your own data.',
      file: 'https://dl.dropboxusercontent.com/s/k4dhuh7hnmoclzf/Simple_Data.csv?dl=0',
      source: ''}
  ];
}
