import Filter from './filter';
import Entity from '../datatypes/entity';
import EntityContainer from '../datatypes/entityContainer';

/**
 * This class is used to describe a value filter or filtering by value of the the sourceNode.
 * All filtering performed by this filter is for the source nodes.
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

  /**
   * All entries whos sourceNode is one of the before processed media entities will be added to the resultData
   * @param data the data to perform the action on.
   * @returns {Array<any>} of filtered entities.
   */
  public meetCriteria(data: any): any
  {
    this._resultData = new Array<any>();
    this._container.clearEntities();  // Clears the container before processing data
    this.processData(data);

    for (let entry of data)
    {
      for (let entity of this._container.entities)
      {
        if (entry.sourceNode === entity.identifier)
          this._resultData.push(entry);
      }
    }

    return this._resultData;
  }

  /**
   * Find all legal entities which totalAmount is between the min and max values.
   * @param data where the entities should be found in.
   */
  private processData(data: any): void
  {
    this.generateDataStructure(data);
    let toRemove: number[] = [];
    // Filter DataStructure
    for (let entity in this._container.entities)
    {
      let totalAmount = this._container.entities[entity].totalAmount;
      if (totalAmount < this._minValue || totalAmount > this._maxValue)
      {
        toRemove.push(parseInt(entity, 0));
      }
    }

    this._container.filterEntityContainer(toRemove);
  }

  /**
   * This method generates a datastructure where all legal entities and their totalAmount
   * (total of all payments corresponding to this legal company) are stored.
   * @param data or the raw values.
   */
  private generateDataStructure(data: any): void
  {
    this._container.clearEntities();
    if(data === null || data === undefined)
      return;
    // Generating DataStructure
    for (let entry of data)
    {
      let ent = this._container.findEntity(entry.sourceNode);

      if (ent === null)
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

  /**
   * Method for calculating the min and max value of the legal entities totalAmounts
   * (total of all payments corresponding to this legal company).
   * @param data for which the min and max should be calculated.
   */
  public calculateMinMaxValues(data: any): void
  {
    this.generateDataStructure(data);

    let minValue: number = 0;
    let maxValue: number = 0;
    let first: boolean = true;

    for (let entity of this._container.entities)
    {
      let totalAmount = entity.totalAmount;

      if (first)
      {
        minValue = totalAmount;
        maxValue = totalAmount;
        first = false;
      }

      if (totalAmount < minValue)
        minValue = totalAmount;

      if (totalAmount > maxValue)
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
