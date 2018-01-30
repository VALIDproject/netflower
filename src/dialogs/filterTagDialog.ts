import * as events from 'phovea_core/src/event';
import {AppConstants} from '../app_constants';
import * as d3 from 'd3';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';

import TagFilter from '../filters/tagFilter';

export default class FilterTagDialog {

  private _activeTags: d3.Set;
  private _availableTags: d3.Set;
  private message: string;
  private dialog;

  constructor(private tagFilter: TagFilter, private d) {
    this._activeTags = d3.set(tagFilter.activeTags.values());
    this._availableTags = d3.set(tagFilter.availableTags.values());
    this.setAvailableTags();
    this.buildDialog();
  }

  private setAvailableTags() {
    this.activeTags.forEach((tag:string) => this._availableTags.remove(tag));
  }

  private updateDialogMessage() {
    this._activeTags = d3.set(this.sortTagsByAlphabet(this._activeTags));
    this._availableTags = d3.set(this.sortTagsByAlphabet(this._availableTags));
    this.message = this.buildActiveTagsHtml() + this.buildAvailableTagsHtml();
    $('.bootbox-body').html(this.message);
    this.initTagButtons();
  }

  private buildActiveTagsHtml() {
    let message = "<p>Tags selected:";
    if(this._activeTags.empty()) {
      return message + "None</p></br>";
    } else {
      message += "</p>";
      this._activeTags.forEach((value:string) =>
        message += "<button type=\"button\" class=\"tagBtn active btn btn-primary btn-sm waves-light\" " +
          "style=\"margin-right: 10px;\">" + value + "</button>"
      );
      return message + "</p>";
    }
  }

  private buildAvailableTagsHtml() {
    let message = "<p>Tags available:";
    if(this._availableTags.empty()) {
      return message += "None</p>";
    } else {
      message += "</p>";
      this._availableTags.forEach((value: string) =>
        message += "<button type=\"button\" class=\"tagBtn btn btn-primary btn-sm waves-light\" " +
          "style=\"margin-right: 10px;\">" + value + "</button>"
      );
    }
    return message + "</p>";
  }

  private initTagButtons() {
    var that = this;
    $('.tagBtn').click(function() {
      if($(this).hasClass('active')) {
        that._availableTags.add($(this).html());
        that._activeTags.remove($(this).html());
      } else {
        that._activeTags.add($(this).html());
        that._availableTags.remove($(this).html());
      }
      that.updateDialogMessage();
    });
  }

  private buildDialog() {
    let that = this;
    this.dialog = bootbox.dialog({
        className: 'dialogBox',
        title: 'Filter tags',
        message: '<p><i class="fa fa-spin fa-spinner"></i> Loading...</p>',
        buttons: {
          clear: {
            label: "Clear tags",
            className: "btn-warning pull-left",
            callback: function() {
              that._activeTags.forEach((value:string) => that._availableTags.add(value));
              that._activeTags = d3.set([]);
              that.updateDialogMessage();
              return false;
            }
          },
          cancel: {
            label: "Cancel",
            className: 'btn-cancel',
            callback: function(){
              that._activeTags = that.tagFilter.activeTags;
              that._availableTags = that.tagFilter.availableTags;
              console.log('Custom cancel clicked');
            }
          },
          ok: {
            label: "Apply",
            className: 'btn-info',
            callback: function(){
              that.tagFilter.activeTags = that._activeTags;
              that.tagFilter.availableTags = that._availableTags;
              that.tagFilter.active = that._activeTags.empty() ? false : true;
              events.fire(AppConstants.EVENT_FILTER_CHANGED, that.d, null);
            }
          }
        }
      });
      this.dialog.init(() => {
        this.updateDialogMessage();
      });
  }

  private sortTagsByAlphabet(tagSet: d3.Set) {
    let tags = tagSet.values();
    tags.sort(function(a, b) {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    });
    return tags;
  }

  get activeTags(): d3.Set {
    return this._activeTags;
  }

  set updateActiveTags(_activeTags: d3.Set) {
    this._activeTags = this.activeTags;
    this.updateDialogMessage();
  }
}
