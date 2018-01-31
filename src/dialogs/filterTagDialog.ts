import * as events from 'phovea_core/src/event';
import {AppConstants} from '../app_constants';
import * as d3 from 'd3';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';

import TagFilter from '../filters/tagFilter';

export default class FilterTagDialog {

  private _activeTags: d3.Set;
  private _availableTags: d3.Set;
  private _term: string = "";
  private _searchResult: d3.Set;

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
    this.message = this.buildActiveTagsHtml() + this.buildSearchTagsHtml() + this.buildAvailableTagsHtml();
    $('.bootbox-body').html(this.message);
    this.initTagButtons();
  }

  private buildActiveTagsHtml() {
    let message = "<small>Tags selected:";
    if(this._activeTags.empty()) {
      return message + "<b>None</b></small>";
    } else {
      message += "</small><div style=\"margin: 10px 0px 20px 0px;\">";
      this._activeTags.forEach((value:string) =>
        message += this.createButtonHtmlByValue(value, true)
      );
      return message + "</div>";
    }
  }

  private buildSearchTagsHtml() {
    let placeholder = this._term == "" ? "Search for tag..." : this._term;
    let message = `
      <div class='input-group input-group-xs' style='margin: 10px 0px; width: 60%;'>
        <input type='text' id='tagSearchFilter' class='form-control' placeholder='${placeholder}'/>
        <span class='input-group-btn'>
          <button type='button' id='tagSearchButton' class='btn btn-primary'><i class='fa fa-search'></i></button>
        </span>
        <span class='input-group-btn'>
          <button type='button' id='clearTagSearch' class='btn btn-secondary'><i class='fa fa-times'></i></button>
        </span>
      </div>
    `
    return message;
  }

  private buildAvailableTagsHtml() {
    let message = "<small>Tags available:";
    if(this._availableTags.empty()) {
      return message += "<b>None</b></small>";
    } else {
      message += "</small><div style=\"margin: 10px 0px\">";
      if(this._term == "") {
        this._availableTags.forEach((value: string) =>
        message += this.createButtonHtmlByValue(value, false)
        );
      } else {
        this._searchResult = d3.set(this.sortTagsByAlphabet(this._searchResult));
        this._searchResult.forEach((value: string) =>
        message += this.createButtonHtmlByValue(value, false)
        );
      }
    }
    return message + "</div>";
  }

  private createButtonHtmlByValue(value: string, active: boolean) {
    return "<button type=\"button\" class=\"tagBtn" + (active ? " active " : " ") +
          "btn btn-primary btn-sm waves-light\" style=\"margin-right: 10px;\">" + value + "</button>";
  }

  private initTagButtons() {
    var that = this;
    $('.tagBtn').click(function() {
      if($(this).hasClass('active')) {
        that._availableTags.add($(this).html());
        that._activeTags.remove($(this).html());
        if(that._term != "")
          if($(this).html().toLowerCase().startsWith(that._term))
            that._searchResult.add($(this).html());
      } else {
        that._activeTags.add($(this).html());
        that._availableTags.remove($(this).html());
        if(that._term != "")
          that._searchResult.remove($(this).html());
      }
      that.updateDialogMessage();
    });

    const tagSearch = (d) => {
      const value: string = $('#tagSearchFilter').val();
      // search
      that._term = value.toLowerCase();

      that._searchResult = d3.set();
      //value contains term?
      that._availableTags.forEach((value:string) => {
        if(value.toLowerCase().startsWith(that._term))
          that._searchResult.add(value);
      });
      that.updateDialogMessage();
    };
    $('#tagSearchFilter').keypress((e) => {
      if (e.which === 13) {
        tagSearch(e);
      }
    });
    $('.tagSearchButton').on('click', tagSearch);

    $('.clearTagSearch').on('click', (d) => {
      $('#tagSearchFilter').val('');
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
