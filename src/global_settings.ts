/**
 * Created by Christina on 21.04.2017.
 */

import * as events from 'phovea_core/src/event';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';
import 'imports-loader?jQuery=jquery!BootSideMenu/js/BootSideMenu.js';
import 'style-loader!css-loader!BootSideMenu/css/BootSideMenu.css';
import {MAppViews} from './app';
import {AppConstants} from './app_constants';
import {LOG_INFO} from './language';

class GlobalSettings implements MAppViews {

  private $node: d3.Selection<any>;

  constructor(parent: Element, private options: any) {
    this.$node = d3.select(parent)
      .append('div')
      .classed('globalSettings', true);
  }

  /**
   * Initialize the view and return a promise
   * that is resolved as soon the view is completely initialized.
   * @returns {Promise<SankeyDiagram>}
   */
  init() {
    this.build();
    this.attachListener();

    //Return the promise directly as long there is no dynamical data to update
    return Promise.resolve(this);
  }


  /**
   * Build the basic DOM elements
   */
  private build() {
    this.$node.html(`
    <div id='sideMenu'>
      <form class='noteBox'>
        <div class='form-group'>
          <h4>Notebook:</h4>
          <div class='col-auto'>
             <div class='input-group'>         
                <span class='input-group-btn' style='padding-right: 2px;'>
                  <span class='btn btn-default btn-file2'>
                    Load Notes 
                    <input type='file' id='globalFiles' accept='.txt' required />
                  </span>
                </span>
              <input readonly='readonly' placeholder='TXT File' class='form-control' id='globalFileName' type='text'>
             </div>
             <hr/>
             <button type='button' id='globalSaveBtn' class='btn btn-primary'>Save Notes</button>
          </div>
        </div>
        <div class='form-group' id='noteBox'>
          <label for='noteArea'>Take Notes:</label>
          <textarea class='form-control' id='noteArea' rows='16' cols='80' wrap='off'></textarea>
        </div>
      </form>
    
      <div class='clearBox'>
        <hr/>
        <h4>Export Logs:</h4>
        <p>${LOG_INFO}</p>
      </div>
    </div>
    `);

    (<any>$('#sideMenu')).BootSideMenu();
  }

  /**
   * Attach the event listeners
   */
  private attachListener() {
    // Watches for changes on the load file button.
    $('#globalFiles').change(function() {
      $('#globalFileName').val($(this).val().replace('C:\\fakepath\\', ''));

      // Read out the file
      const fileInput = <HTMLInputElement>d3.select('#globalFiles').node();
      const file = fileInput.files[0];
      const fileReader = new FileReader();

      // Define the reading functionality
      fileReader.onload = function (e) {
        $('#noteArea').remove();
        const text = (e as any).target.result;
        d3.select('#noteBox').append('textarea')
          .attr('id', 'noteArea')
          .attr('class', 'form-control')
          .attr('rows', '16')
          .attr('cols', '80')
          .attr('wrap', 'off')
          .text(text);
      }

      // Read the file and display all
      fileReader.readAsText(file, 'UTF-8');
    });

    // Watches for actions on the save button.
    this.$node.select('#globalSaveBtn').on('click', (e) => {
      d3.select('#globalSaveBtn').attr('disabled', true);
      this.saveFile();
    });

    // Watch for page pre reaload and store the notes
    window.onbeforeunload = function(event) {
      localStorage.setItem('noteAreaText', $('#noteArea').val());
      event.returnValue = 'Set';
    }

    // Retrieve the notes once page is loaded
    window.onload = function() {
      const text = localStorage.getItem('noteAreaText');
      if (text !== null) {
        $('#noteArea').val(text)
      };
    }
  }

  /**
   * This method creates a file saving possiblity.
   */
  private saveFile(): void {
    const saveText = $('#noteArea').val();
    const textBlob = new Blob([saveText], {type: 'text/plain'});
    let fileName: string;

    var dialog = bootbox.dialog({
      title: 'Enter a name for the file',
      className: 'dialogBoxLeft',
      message: `
      <form>
        <div class='form-group'>
          <input type='email' class='form-control' id='dialogFileName' placeholder='Example'>
          <small class='form-text text-muted'>Info: File extension .txt not required.</small>
        </div>
      </form>
      `,
      buttons: {
        cancel: {
          label: 'Cancel',
          className: 'btn-default',
          callback: function () {
            d3.select('#globalSaveBtn').attr('disabled', null);
            console.log('Cancel clicked.');
          }
        },
        ok: {
          label: 'Ok',
          className: 'btn-primary',
          callback: function () {
            fileName = $('#dialogFileName').val();

            if (fileName === '' || fileName === null) {
              fileName = 'NetFlower_Note';
            }

            // Create the download fake link
            let link = document.createElement('a');
            link.download = fileName;
            link.innerHTML = 'Download File';

            // Perform the actual download
            if (window.URL != null) {
              link.href = window.URL.createObjectURL(textBlob);
            } else {
              link.href = window.URL.createObjectURL(textBlob);
              link.onclick = this.destroyLink;
              link.style.display = 'none';
              document.body.appendChild(link);
            }

            link.click();
            d3.select('#globalSaveBtn').attr('disabled', null);
          }
        }
      }
    });
  }

  /**
   * Litte utitlity function to remove unused fake links
   * @param e event that happens on click for example
   */
  private destroyLink(e) {
    document.body.removeChild(e.target);
  }
}

/**
 * Factory method to create a new SankeyDiagram instance
 * @param parent
 * @param options
 * @returns {SankeyDiagram}
 */
export function create(parent: Element, options: any) {
  return new GlobalSettings(parent, options);
}
