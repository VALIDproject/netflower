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

  public meetCriteria(data: any): any
  {
    this._resultData = new Array<any>();
    this.processData(data);

    for(let entry of data)
    {
      for(let entity of this._container.entities)
      {
        if(entry.targetNode === entity.identifier)
          this._resultData.push(entry);
      }
    }

    return this._resultData;
  }

  private processData(data: any): void
  {
    this._container.clearEntities();

    //generating DataStructure
    for(let entry of data)
    {
      let ent = this._container.findEntity(entry.targetNode);

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

  public printData(): void
  {
    console.log('Euro Filter: ' + this.minValue + ' / ' + this.maxValue);
  }
}
