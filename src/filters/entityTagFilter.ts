import TagFilter from './tagFilter';
import * as d3 from 'd3';
import Entity from '../datatypes/entity';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class EntityTagFilter extends TagFilter
{
  //Find all media entities which totalAmount is between the min and max values
  protected processData(data: any): void
  {
    let that = this;
    this._resultData = data.filter((d) => {
      const tagsAsText:string = d.sourceTag;
      if (tagsAsText !== undefined) {
        if (tagsAsText !== '') {
          const values:d3.Set = d3.set(tagsAsText.split(","));
          if(that._activeTags.size() <= values.size()) {
            return that._activeTags.values().every(function(activeTag) {
              return values.has(activeTag);
            });
          }
        }
      }
      return false;
    });
  }

  public printData(): void
  {
    console.log('Entity Tag Filter: ' + this._activeTags.values());
  }
}
