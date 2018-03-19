import TagFilter from './tagFilter';
import * as d3 from 'd3';
import Entity from '../datatypes/entity';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class EntityTagFilter extends TagFilter
{
  /**
   * Find all legal entities which are associated with the active tags
   * @param data to apply the search on
   */
  protected processData(data: any): void
  {
    let that = this;
    let tags:d3.Set = d3.set([]);
    let map = new Map<string, d3.Set>();

    for(let entry of data) {
      let key = entry.sourceNode;
      let value: d3.Set = map.get(key);

      const tagsAsText:string = entry.sourceTag;
      const tagValues:Array<string> = tagsAsText.split("|");
      if (tagsAsText !== '') {
        if(value === null || value === undefined) {
          value = d3.set();
          tagValues.forEach(function (tag) {
            value.add(tag);
          })
        } else {
          tagValues.forEach(function (tag) {
            if(tag !== '' && !value.has(tag))
              value.add(tag);
          })
        }
        map.set(key, value);
      }
    }

    this._resultData = data.filter((entry) => {
      const key = entry.sourceNode;
      if(key === null || key === undefined) {
        return false;
      }
      else {
        const values = map.get(key);
        if(values === null || values === undefined) {
          return false;
        }
        else {
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
   * Finds all legal entity tags for a specific legal entity.
   * @param data with tags associated to its entries
   * @param {string} val name of the legal entity
   * @returns {d3.Set} of tags associated to the specified legal entity
   */
  public getTagsByName(data: any, val: string): d3.Set
  {
    let resultSet:d3.Set = d3.set([]);
    for(let entry of data) {
      if(entry.sourceNode.indexOf(val) !== -1) {
        const tagsAsText:string = entry.sourceTag;
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

  public printData(): void
  {
    console.log('Entity Tag Filter: ' + this._activeTags.values());
  }
}
