import * as events from 'phovea_core/src/event';
import {AppConstants} from '../app_constants';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';

import TagFilter from '../filters/tagFilter';
import EntityTagFilter from '../filters/entityTagFilter';

/**
 * This class is used to describe a dialog to manage the tags of a node.
 * Changes performed by this dialog is either applied to a source or a target node,
 * depending on the provided TagFilter instance.
 */
export default class ManageFilterDialog {

  private _tags: d3.Set;
  private _availableTags: d3.Set;

  private message: string;
  private dialog;

  constructor(private d, private _originalTags: d3.Set, private tagFilter: TagFilter,) {
    this._tags = d3.set(this._originalTags.values());
    this.createAvailableTagSet(tagFilter);
    this.buildDialog();
  }

  /**
   * Updates the content of the dialog window
   */
  private updateDialogMessage() {
    this._tags = d3.set(this.sortTagsByAlphabet(this._tags));
    this.message = this.buildActiveTagsHtml() + this.buildAddNewTagHtml() + this.buildSuggestedTagsHtml();
    $('.bootbox-body').html(this.message);
    this.initTagButtons();
  }

  /**
   * Builds the html code for tags currently active for the node.
   */
  private buildActiveTagsHtml() {
    let message = "<small>Tags:";
    if(this._tags.empty()) {
      return message + "<b>None</b></small>";
    } else {
      message += "</small><div style=\"margin: 10px 0px 20px 0px;\">";
      this._tags.forEach((value:string) =>
        message += this.createButtonHtmlByValue(value, true)
      );
      return message + "</div>";
    }
  }

  /**
   * Builds the html code for an input to add a new tag to the list of active tags.
   */
  private buildAddNewTagHtml() {
    let placeholder = "Add a new tag...";
    let message = `
      <div class='input-group input-group-xs' style='margin: 10px 0px; width: 60%;'>
        <input type='text' id='addTagInput' class='form-control' placeholder='${placeholder}'/>
        <span class='input-group-btn'>
          <button type='button' id='addTagButton' class='btn btn-primary'><i class='fa fa-plus'></i></button>
        </span>
        <span class='input-group-btn'>
          <button type='button' id='clearAddTag' class='btn btn-secondary'><i class='fa fa-times'></i></button>
        </span>
      </div>
    `
    return message;
  }

  /**
   * Builds the html code for tags currently not active for the tag, but overall available to add to the list.
   */
  private buildSuggestedTagsHtml() {
    let message = "<small>Suggested Tags:";
    if(this._availableTags.empty()) {
      return message += "<b>None</b></small>";
    } else {
      message += "</small><div style=\"margin: 10px 0px\">";
      for (let value of this._availableTags.values()) {
        if(!this._tags.has(value)) {
          message += this.createButtonHtmlByValue(value, false)
        }
      }
    }
    return message + "</div>";
  }

  /**
   * Get the html code for a new tag button.
   * @param value of button label, active whether the tag is currently active
   * @returns {string} of the html code creating a new tag button.
   */
  private createButtonHtmlByValue(value: string, active: boolean) {
    return "<button type=\"button\" class=\"tagBtn" + (active ? " active " : " ") +
          "btn btn-primary btn-sm waves-light\" style=\"margin-right: 10px; margin-bottom: 10px;\">" + value + "</button>";
  }

  /**
   * Defines the activities that follow when clicking on the tag buttons or using the input field.
   */
  private initTagButtons() {
    const that = this;
    $('.tagBtn').click(function() {
      const tagBtnElem = this;
      if($(tagBtnElem).hasClass('active')) {
        const tagLabel = $(tagBtnElem).html();
        bootbox.confirm({
          className: 'dialogBox',
          message: "This removes the tag " + tagLabel + ". Do you wish to proceed?",
          buttons: {
            confirm: {
              label: 'Yes',
              className: 'btn-info'
            },
            cancel: {
              label: 'No',
              className: 'btn-cancel'
            }
          },
          callback: function (result) {
            if (result) {
              that._tags.remove(tagLabel);
              that.updateDialogMessage();
            }
          }
        });
      } else {
        that._tags.add($(this).html());
        that.updateDialogMessage();
      }
    });

    const addTag = (d) => {
      let value: string = $('#addTagInput').val();
      value = value.charAt(0).toUpperCase() + value.slice(1);
      // check if tag already exists in tag list
      if(that._tags.has(value)) {
        bootbox.alert({
          className: 'dialogBox',
          message: "Node already has provided tag!"
        });
        $('#addTagInput').val("");
        $('#addTagInput').focus();
      } else {
        // add tag to tag list
        that._tags.add(value);
        that.updateDialogMessage();
      }
    };
    $('#addTagInput').keypress((e) => {
      if (e.which === 13) {
        addTag(e);
      }
    });
    $('#addTagButton').on('click', addTag);

    $('#clearTagSearch').on('click', (e) => {
      $('#addTagInput').val("");
    });
  }

  private getDialogTitle() {
    return 'Manage Tags for ' + this.d.name;
  }

  /**
   * Creates and opens the dialog window for filtering tags.
   */
  private buildDialog() {
    let that = this;
    this.dialog = bootbox.dialog({
      className: 'dialogBox',
      title: that.getDialogTitle(),
      message: '<p><i class="fa fa-spin fa-spinner"></i> Loading...</p>',
      buttons: {
        clear: {
          label: "Clear tags",
          className: "btn-warning pull-left",
          callback: function() {
            that._tags = d3.set([]);
            that.updateDialogMessage();
            return false;
          }
        },
        cancel: {
          label: "Cancel",
          className: 'btn-cancel',
          callback: function(){
            that._tags = that._originalTags;
          }
        },
        ok: {
          label: "Apply",
          className: 'btn-info',
          callback: function(){
            localforage.getItem('data').then((value) => {
              return that.applyTagChangesToNode(value);
            });
          }
        }
      }
    });
    this.dialog.init(() => {
      this.updateDialogMessage();
    });
  }

  private applyTagChangesToNode(data: any): any {
    const that = this;
    let newData = data;
    for (let entry of newData) {
      let term = this.d.name.toLowerCase();
      let sourceValue = entry.sourceNode.toLowerCase();
      let targetValue = entry.targetNode.toLowerCase();
      if(sourceValue === term) {
        entry.sourceTag = this.formatTagsForCSV(this._tags);
      }
      if (targetValue === term) {
        entry.targetTag = this.formatTagsForCSV(this._tags);
      }
    }
    localforage.setItem('data', newData).then(function(value) {
      console.log('Tag changes were applied to the data');
      events.fire(AppConstants.EVENT_FILTER_CHANGED, that.d, null);
      return localforage.getItem('data');
    });
  }

  private createAvailableTagSet(tagFilter: TagFilter) {
    this._availableTags = d3.set(tagFilter.availableTags.values());
    for (let value of tagFilter.activeTags.values()) {
      this._availableTags.add(value);
    }
  }

  /**
   * Sorts a set of tags in alphabetical order
   * @param tagSet the set of tags to apply the sorting on.
   * @returns {Array<any>} of alphabetically sorted tags.
   */
  private sortTagsByAlphabet(tagSet: d3.Set) {
    let tags = tagSet.values();
    tags.sort(function(a, b) {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });
    return tags.map(function(tag) { return tag.trim()});
  }

  /**
   * Format tags such that they have a consistent formatting in the CSV file.
   * @param {d3.Set} tags to format
   * @returns {string} the formatted tags as text
   */
  private formatTagsForCSV(tags: d3.Set): string {
    return tags.values().join(" | ")
  }
}
