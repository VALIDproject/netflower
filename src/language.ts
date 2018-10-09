/**
 * Created by Florian Grassinger on Mon, 10 Apr 2017 08:54:58 GMT.
 *
 * Add your constants here or Strings in order to make it possible for future distributions to change the language.
 * If all strings and texts are written in constants it's easier to change the language depending on the region settings.
 */
import {AppConstants} from './app_constants';

export const APP_NAME = 'Valid';
export const HELLO_WORLD = 'Hello World this is VALID... or will be...';

export const IMPORT_FEATURES = `<h4>Features of Netflower:</h4>Netflower is developed to explore large bipartite network data.
The tool supports you finding interesting aspects in the data. You cannot directly create visualizations out of it, but you can export the data
based on your exploration state.`;

export const IMPORT_DISCLAIMER = `<h4>Important Information:</h4>The data you load will only be stored locally on your computer.
When you close the browser, the data is retained. When the computer is restarted or you upload new data,
the data and exploration steps are lost.`;

export const ERROR_TOOMANYNODES = `Your current <font color='#DA5A6B'><strong>FILTER</strong></font>
has too many nodes to display for the visual space. <br/> Please press the <strong>Show More</strong>
utton at the end of the sankey diagram.<br/>This will create more visual space for the nodes in order to be loaded.
<br/><br/><strong>Reapeat if still not shown!</strong>`;

export const ERROR_TOOMANYFILTER = `Your current <font color='#DA5A6B'><strong>FILTER</strong></font> settings are
too restrictive. There is <strong>NO DATA</strong> to show!<br/>Please change your filter settings in order to show
data on the visualization.`;

export const NOTAGS_INFO = `There are <font color='#DA5A6B'><strong>no tags</strong></font> to display tag flows.`;

export const USAGE_INFO = `<strong><h3>Data format:</h3></strong><br/>
This tool requires a specific format for the tables in order to visualize them appropriate. Also <strong>.CSV</strong> are
only accepted. If the required format isn't met, it will result in erros or no displayed data. The format of the
table headings defines all further views but needs to be in a specific order:`;

export const BACK_INFO = `Upon hitting the <strong>OK</strong> button, you will be redirected to the data load page.<br/>
<strong>NOTE:</strong> This will reload the page and the previous data will be lost!!<br/><br/>
Be sure you don't lose anything important or save your progress before you proceed.`;

/*export const TIME_INFO = `Select here the time range of the visualization. You have various controls avaialbe for the selection.
 The controls are listed on the right near the box. Inide the box are Quarters which you can choose. Below
 you will see your current selection. After you finished, hit the <strong>Submit</strong> button in order
 to change the visualization.`;*/

export const TIME_INFO = `Select here the time range of the visualization.<br/>
1) Click & Drag mouse for rectangle selection.<br/>
2) Click one elment to make a single selection.<br/>
3) CTRL + Click to make a multi selection.`;

export const ATTR_INFO = `Select here the attributes you want to filter for on the current visualization. The attributes
are read from your imported .csv file. If you see no checkboxes here, you probably have no attributes defined.`;

export const LOG_INFO = `Export logs for evaluation and testing purpose. The application tracks your actions and the state of the visualization the whole time. By clicking on the
button a <strong>Log File</strong> will be created and saved locally on your machine.`;

export const NO_TIME_POINTS = `<span class='label label-warning' style='font-weight: normal;'>Warning</span>
You have no time points selected! <br/> In order to prevent the application from showing nothing or unwanted results,
the last defined time points were choosen.`;

export const EXPORT_WARN = `<span class='label label-warning' style='font-weight: normal;'>Warning</span>
Something went wrong, we can't find data! <br/> Reduce the amount of filters, reload the page or change your settings
and try to export your data again.`;

export const EXPORT_INFO = `<span class='label label-info' style='font-weight: normal; background: #45B07C;'>Info</span>
You are going to download a file with the name: <strong>flows</strong> and the current time stamp which contains the exported flow data of the current
view. Proceed with OK if you want to download the file.`;

export const EXPORT_INFO2 = `<span class='label label-info' style='font-weight: normal; background: #45B07C;'>Info</span>
You are going to download a file with the name: <strong>timeseries</strong> and the current time stamp which contains the exported data of the current
view. Proceed with OK if you want to download the file.`;

export const DOWNLOAD_INFO = `The <strong>button</strong> below let's you download a sample dataset for the application.
It contains numerous media transperency data rows who are already in the right format and with meaningful headings.`;
