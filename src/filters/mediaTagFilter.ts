import Filter from './filter';
import * as d3 from 'd3';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class MediaTagFilter implements Filter
{
  private resultData: Array<any>;

  private queriedValues: d3.Set;
  //private _selectedTags: Array<String>;
  //private _container: EntityContainer;

  constructor()
  {
    this.queriedValues = d3.set([]);
    //this._resultData = new Array<any>();
    //this._container = new EntityContainer();
  }

  get values():Array<string>
  {
    return this.queriedValues.values();
  }

  set values(val:Array<string>)
  {
    this.queriedValues = d3.set(val);
  }

  /*get selectedTags():Array<String>
  {
    return this._selectedTags;
  }

  set selectedTags(val:Array<String>)
  {
    this._selectedTags = val;
  }*/

  //check if the value meets the entries tag value
  public meetCriteria(data: any): any
  {
    this.queriedValues.forEach((value:String) => console.log(value));

    /*this.resultData = data.filter((d) => {
        return this.queriedValues.has(d.sourceTag) || this.queriedValues.has(d.targetTag);
    });*/

    return this.resultData;
  }

  // Find all media entities which are tagged by one of the selected tags
  /*private processData(data: any): void
  {
    this.generateDataStructure(data);

    //Filter DataStructure
    for(let entity of this._container.entities)
    {
      let tagName = entity.tagName;
      if(this._selectedTags.indexOf(tagName) === -1)
      {
        this._container.removeEntity(entity);
      }
    }
  }

  private generateDataStructure(data: any): void
  {
    this._container.clearEntities();

    if(data === null || data === undefined)
      return;

    //generating DataStructure
    for(let entry of data)
    {
      let ent = this._container.findEntity(entry.sourceNode);
      if(ent === null) {

        ent = new Entity(entry.sourceNode);
        ent.addPayment(entry.valueNode);
        this._container.addEntity(ent);
      }
      else
      {
        ent.addPayment(entry.valueNode);
      }

      ent = this._container.findEntity(entry.targetNode);

      if(ent === null)
      {
        ent = new Entity(entry.targetNode);
        ent.addPayment(entry.valueNode);
        this._container.addEntity(ent);
      }
      else
      {
        ent.addPayment(entry.valueNode);
      }
    }
  }*/

  public resetValues(): void {
    this.queriedValues = d3.set([]);
  }

  public addValue(val: string): void {
    this.queriedValues.add(val);
  }

  public printData(): void
  {
    console.log('Tag Filter: ' + this.values);
  }
}
