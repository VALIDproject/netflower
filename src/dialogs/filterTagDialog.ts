import * as events from 'phovea_core/src/event';
import {AppConstants} from '../app_constants';
import * as d3 from 'd3';
import * as $ from 'jquery';
import * as bootbox from 'bootbox';

import TagFilter from '../filters/tagFilter';
import EntityTagFilter from '../filters/entityTagFilter';

/**
 * This class is used to describe a dialog to filter nodes by tags.
 * Filtering performed by this filter is either for source or target nodes,
 * depending on the provided TagFilter instance.
 */
export default class FilterTagDialog {

  private _activeTags: d3.Set;
  private _availableTags: d3.Set;
  private _term: string = "";
  private _searchResult: d3.Set;

  private message: string;
  private dialog;
  private columnLabels;

  constructor(private d, private tagFilter: TagFilter, private tagGroupHTMLElement) {
    this._activeTags = d3.set(tagFilter.activeTags.values());
    this._availableTags = d3.set(tagFilter.availableTags.values());
    this.columnLabels = this.getColumnLabels();
    this.setAvailableTags();
    this.buildDialog();
  }

  private setAvailableTags() {
    this.activeTags.forEach((tag:string) => this._availableTags.remove(tag));
  }

  /**
   * Updates the content of the dialog window
   */
  private updateDialogMessage() {
    this._activeTags = d3.set(this.sortTagsByAlphabet(this._activeTags));
    this._availableTags = d3.set(this.sortTagsByAlphabet(this._availableTags));
    this.message = this.buildActiveTagsHtml() + this.buildSearchTagsHtml() + this.buildAvailableTagsHtml();
    $('.bootbox-body').html(this.message);
    this.initTagButtons();
    if (this._term != "") {
      $('#tagSearchFilter').val(this._term);
      $('#tagSearchFilter').focus();
    }
  }

  /**
   * Builds the html code for tags currently selected for filtering.
   */
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

  /**
   * Builds the html code for a search input to look for a specific tag.
   */
  private buildSearchTagsHtml() {
    let placeholder = "Search for tag...";
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

  /**
   * Builds the html code for tags currently not selected, but available for filtering.
   */
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

  /**
   * Get the html code for a new tag button.
   * @param value of button label, active whether the tag is currently selected
   * @returns {string} of the html code creating a new tag button.
   */
  private createButtonHtmlByValue(value: string, active: boolean): string {
    return "<button type=\"button\" class=\"tagBtn" + (active ? " active " : " ") +
      "btn btn-primary btn-sm waves-light\" style=\"margin-right: 10px; margin-bottom: 10px;\">" + value + "</button>";
  }

  /**
   * Defines the activities that follow when clicking on the tag buttons or using the search input.
   */
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
    $('#tagSearchButton').on('click', tagSearch);

    $('#clearTagSearch').on('click', (e) => {
      this._term = "";
      $('#tagSearchFilter').val("");
      tagSearch(e);
    });
  }

  private getDialogTitle() {
    if(this.tagFilter instanceof EntityTagFilter)
      return 'Filter ' + this.columnLabels.sourceNode + ' By Tags';
    else
      return 'Filter ' + this.columnLabels.targetNode + ' By Tags';
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
          }
        },
        ok: {
          label: "Apply",
          className: 'btn-info',
          callback: function(){
            that.tagFilter.activeTags = that._activeTags;
            that.tagFilter.availableTags = that._availableTags;
            that.tagFilter.active = that._activeTags.empty() ? false : true;
            const $tagFilterBox = that.tagGroupHTMLElement.select('.tagFilterBox');
            const $tagFilterBtn = that.tagGroupHTMLElement.select('.tagFilterBtn');
            $tagFilterBox.html('');
            let columnLabels: any = JSON.parse(localStorage.getItem('columnLabels'));
            if(that.tagFilter.active) {
              $tagFilterBtn
                .style('background-color', '#45B07C')
                .style('color', '#FFF')
                .style('border:', 'none');
              if(that.tagFilter instanceof EntityTagFilter)
                $tagFilterBtn.html(`Change ${columnLabels.sourceNode} Tags`);
              else
                $tagFilterBtn.html(`Change ${columnLabels.targetNode} Tags`);
              const $tagContainer = $tagFilterBox
                  .append('div')
                  .attr('class', 'tagFilterBoxWrapper');

              // Build the Tag filter text
              let tagFilterText = '';
              for(let i = 0; i < that._activeTags.size(); i++) {
                let value = that._activeTags.values()[i];
                if (i === that._activeTags.size() -1) {
                  tagFilterText += value;
                } else {
                  tagFilterText += (value + ', ');
                }
              }
              // Append the text elements
              $tagContainer
                    .append('p')
                    .attr('class', 'tagFilterBoxElems')
                    .text(tagFilterText);

              // Resize the box...
              $tagFilterBox.style('width', function() {
                  return (d3.select('.controlBox') as any).node().getBoundingClientRect().width + 'px';
              });
            } else {
              $tagFilterBtn
                .style('background-color', '#FFF')
                .style('color', '#555')
                .style('border:', '1px solid #CCC')
              if(that.tagFilter instanceof EntityTagFilter)
                $tagFilterBtn.html(`Set ${columnLabels.sourceNode} Tags`);
              else
                $tagFilterBtn.html(`Set ${columnLabels.targetNode} Tags`);
            }
            events.fire(AppConstants.EVENT_FILTER_CHANGED, that.d, null);
          }
        }
      }
    });
    this.dialog.init(() => {
      this.updateDialogMessage();
    });
  }

  /**
   * Get all column names for the data
   * @returns {any} object which contains the column names saved in the local storage.
   */
  private getColumnLabels(): any {
    let columnLabels: any = JSON.parse(localStorage.getItem('columnLabels'));
    if (columnLabels == null) {
      columnLabels = {};
      columnLabels.sourceNode = 'Source';
      columnLabels.targetNode = 'Target';
      columnLabels.valueNode = '';
    }
    return columnLabels;
  }

  /**
   * Sorts a set of tags in alphabetical order
   * @param tagSet the set of tags to apply the sorting on.
   * @returns {Array<any>} of alphabetically sorted tags.
   */
  private sortTagsByAlphabet(tagSet: d3.Set):any {
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
