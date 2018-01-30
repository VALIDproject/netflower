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
    this._resultData = data.filter((d) => {
      return this._activeTags.has(d.sourceTag);
    });
  }

  public printData(): void
  {
    console.log('Entity Tag Filter: ' + this._activeTags.values());
  }
}
