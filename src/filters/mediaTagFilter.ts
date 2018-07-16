import TagFilter from './tagFilter';
import * as d3 from 'd3';
import Entity from '../datatypes/entity';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class MediaTagFilter extends TagFilter
{
  /**
   * Find all media institutions which are associated with the active tags
   * @param data to apply the search on
   */
  protected processData(data: any): void
  {
    let that = this;
    let tags: d3.Set = d3.set([]);
    let map = new Map<string, d3.Set>();

    for (let entry of data) {
      let key = entry.targetNode;
      let value: d3.Set = map.get(key);

      const tagsAsText: string = entry.targetTag;
      if (tagsAsText !== '' && tagsAsText !== undefined) {
        const tagValues: Array<string> = tagsAsText.split("|");
        if (value === null || value === undefined) {
          value = d3.set();
          tagValues.forEach(function (tag) {
            value.add(tag.trim());
          })
        } else {
          tagValues.forEach(function (tag) {
            if (tag !== '' && !value.has(tag))
              value.add(tag);
          })
        }
        map.set(key, value);
      }
    }

    this._resultData = data.filter((entry) => {
      const key = entry.targetNode;
      if (key === null || key === undefined) {
        return false;
      }
      else {
        const values = map.get(key);
        if (values === null || values === undefined) {
          return false;
        } else {
          let bool = false;
          for (const activeTag of that._activeTags.values()) {
            if (values.has(activeTag))
              bool = true;
          }
          return bool;
        }
      }
    });
  }

  /**
   * Finds all media institution tags for a specific media institution.
   * @param data with tags associated to its entries
   * @param {string} val name of the media institution
   * @returns {d3.Set} of tags associated to the specified media institution
   */
  public getTagsByName(data: any, val: string): d3.Set
  {
    let resultSet:d3.Set = d3.set([]);
    for(let entry of data) {
      if(entry.targetNode.indexOf(val) !== -1) {
        const tagsAsText:string = entry.targetTag;
        if (tagsAsText !== undefined) {
          const values:Array<string> = tagsAsText.split("|");
          values.forEach(function (value) {
            if(value !== '' && !resultSet.has(value))
              resultSet.add(value);
          })
        }
      }
    }
    return resultSet;
  }

  public printData(): void {
    console.log('Media Tag Filter: ' + this._activeTags.values());
  }
}
