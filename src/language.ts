/**
 * Created by Florian Grassinger on Mon, 10 Apr 2017 08:54:58 GMT.
 *
 * Add your constants here or Strings in order to make it possible for future distributions to change the language.
 * If all strings and texts are written in constants it's easier to change the language depending on the region settings.
 */
import {AppConstants} from './app_constants';

export const APP_NAME = 'Valid';
export const HELLO_WORLD = 'Hello World this is VALID... or will be...';

export const ERROR_TOOMANYNODES = `Your current <font color='#DA5A6B'><strong>FILTER</strong></font> 
has too many nodes to display for the visual space. <br/> Please press the <strong>Show More</strong> 
utton at the end of the sankey diagram.<br/>This will create more visual space for the nodes in order to be loaded.
<br/><br/><strong>Reapeat if still not shown!</strong>`;

export const ERROR_TOOMANYFILTER = `Your current <font color='#DA5A6B'><strong>FILTER</strong></font> settings are
too restrictive. There is <strong>NO DATA</strong> to show!<br/>Please change your filter settings in order to show
data on the visualization.`;

export const USAGE_INFO = `<strong><font color='#DA5A6B'><h3>ATTENTION!</h3></font></strong><br/>
This tool requires a specific format for the tables in order to visualize them appropriate. Also <strong>.CSV</strong> are
only accepted. If the required format isn't met, it will result in erros or no displayed data. The format of the 
table headings defines all further views but needs to be in a specific order:`;

export const DOWNLOAD_INFO = `The <strong>button</strong> below let's you download a sample dataset for the application.
It contains numerous media transperency data rows who are already in the right format and with meaningful headings.`

export const DOWNLOAD_DIALOG = `You can download the following sample files by klicking on their name:
<br/>
<table class='downloadTable'>
	<tbody>
	<tr>
		<td>Media transperancy</td>
		<td><a href=${AppConstants.FILE1} download=''>Media Transperancy</a></td>
	</tr>
	<tr>
		<td>Asylum stuff</td>
		<td><a href=${AppConstants.FILE1} download=''>Media Transperancy</a></td>
	</tr>
	<tr>
		<td>Farm stuff</td>
		<td><a href=${AppConstants.FILE1} download=''>Media Transperancy</a></td>
	</tr>
	<tr>
		<td>Other stuff</td>
		<td><a href=${AppConstants.FILE1} download=''>Media Transperancy</a></td>
	</tr>
	</tbody>
</table>`
