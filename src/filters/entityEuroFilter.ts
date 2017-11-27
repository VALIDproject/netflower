import Filter from './filter';
import Entity from '../datatypes/entity';
import EntityContainer from '../datatypes/entityContainer';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class EntityEuroFilter implements Filter
{
  private _resultData: Array<any>;

  private _minValue: number;
  private _maxValue: number;
  private _container: EntityContainer;

  constructor()
  {
    this._resultData = new Array<any>();
    this._container = new EntityContainer();
  }

  get minValue():number
  {
    return this._minValue;
  }

  set minValue(min:number)
  {
    this._minValue = min;
  }

  get maxValue():number
  {
    return this._maxValue;
  }

  set maxValue(max:number)
  {
    this._maxValue = max;
  }

  public changeRange(minValue: number, maxValue: number)
  {
    this.minValue = minValue;
    this.maxValue = maxValue;
  }

  // All entries which sourceNode is one of the before processed media entities will be added to the resultData
  public meetCriteria(data: any): any
  {
    this._resultData = new Array<any>();
    this.processData(data);

    for(let entry of data)
    {
      for(let entity of this._container.entities)
      {
        if(entry.sourceNode === entity.identifier)
          this._resultData.push(entry);
      }
    }

    return this._resultData;
  }

  // Find all legal entities which totalAmount is between the min and max values
  private processData(data: any): void
  {
    this.generateDataStructure(data);

    //Filter DataStructure
    for(let entity of this._container.entities)
    {
      let totalAmount = entity.totalAmount;

      if(totalAmount < this._minValue || totalAmount > this._maxValue)
      {
        this._container.removeEntity(entity);
      }
    }
  }

  // This method generates a datastructure where all legal entities and their totalAmount (total of all payments corresponding to this legal company) are stored
  private generateDataStructure(data: any): void
  {
    this._container.clearEntities();

    if(data === null || data === undefined)
      return;

    //generating DataStructure
    for(let entry of data)
    {
      let ent = this._container.findEntity(entry.sourceNode);

      if(ent === null)
      {
        ent = new Entity(entry.sourceNode);
        ent.addPayment(entry.valueNode);
        this._container.addEntity(ent);
      }

      else
      {
        ent.addPayment(entry.valueNode);
      }
    }
  }

 //calculating the min and max value of the legal entities totalAmounts (total of all payments corresponding to this legal company)
  public calculateMinMaxValues(data: any): void
  {
    this.generateDataStructure(data);

    let minValue:number = 0;
    let maxValue:number = 0;
    let first:boolean = true;

    for(let entity of this._container.entities)
    {
      let totalAmount = entity.totalAmount;

      if(first)
      {
        minValue = totalAmount;
        maxValue = totalAmount;
        first = false;
      }

      if(totalAmount < minValue)
        minValue = totalAmount;

      if(totalAmount > maxValue)
      {
        maxValue = totalAmount;
      }
    }

    this._minValue = Math.floor(minValue);
    this._maxValue = Math.ceil(maxValue);
  }

  public printData(): void
  {
    console.log('Entity Value Filter: ' + this.minValue + ' / ' + this.maxValue);
  }
}
