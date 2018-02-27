import * as events from 'phovea_core/src/event';
import {AppConstants} from '../app_constants';
import * as d3 from 'd3';
import * as localforage from 'localforage';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';

export default class ManageFilterDialog {

  private _tags: d3.Set;

  private message: string;
  private dialog;

  constructor(private d, private _originalTags: d3.Set) {
    this._tags = d3.set(this._originalTags.values());
    this.buildDialog();
  }

  private updateDialogMessage() {
    this._tags = d3.set(this.sortTagsByAlphabet(this._tags));
    this.message = this.buildActiveTagsHtml() + this.buildAddNewTagHtml();
    $('.bootbox-body').html(this.message);
    this.initTagButtons();
  }

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

  private createButtonHtmlByValue(value: string, active: boolean) {
    return "<button type=\"button\" class=\"tagBtn" + (active ? " active " : " ") +
          "btn btn-primary btn-sm waves-light\" style=\"margin-right: 10px; margin-bottom: 10px;\">" + value + "</button>";
  }

  private initTagButtons() {
    var that = this;
    $('.tagBtn').click(function() {
      const tagLabel = $(this).html();
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
          if(result) {
            console.log(tagLabel);
            that._tags.remove(tagLabel);
            that.updateDialogMessage();
          }
        }
      });
    });

    const addTag = (d) => {
      let value: string = $('#addTagInput').val();
      value = value.charAt(0).toUpperCase() + value.slice(1);
      // check if tag already exists in tag list
      console.log(that._tags.values());
      console.log(value + ": " + this._tags.has(value));
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
      if(sourceValue.indexOf(term) !== -1) {
        entry.sourceTag = this.formatTagsForCSV(this._tags);
      }
      if (targetValue.indexOf(term) !== -1) {
        entry.targetTag = this.formatTagsForCSV(this._tags);
      }
    }
    localforage.setItem('data', newData).then(function(value) {
      console.log('Tag changes were applied to the data');
      events.fire(AppConstants.EVENT_FILTER_CHANGED, that.d, null);
      return localforage.getItem('data');
    });
  }

  private sortTagsByAlphabet(tagSet: d3.Set) {
    let tags = tagSet.values();
    tags.sort(function(a, b) {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });
    return tags.map(function(tag) { return tag.trim()});
  }

  private formatTagsForCSV(tags: d3.Set) {
    return tags.values().join(" | ")
  }
}
