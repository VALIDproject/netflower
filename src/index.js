/**
 * Created by Caleydo Team on 31.08.2016.
 */
import 'file-loader?name=index.html!extract-loader!html-loader!./index.html';
import 'file-loader?name=404.html-loader!./404.html';
import 'file-loader?name=robots.txt!./robots.txt';
import 'phovea_ui/src/_bootstrap';
import './style.scss';
import { create as createApp } from './app';
var parent = document.querySelector('#app');
createApp(parent).init();
//# sourceMappingURL=index.js.map