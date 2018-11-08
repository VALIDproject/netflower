import Filter from './filter';
import Entity from '../datatypes/entity';
import EntityContainer from '../datatypes/entityContainer';

/**
 * This class is used to describe a value filter or filtering by value of the data set.
 */
export default class MediaEuroFilter implements Filter
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
   * Filters all entries which targetNode is one of the before processed media entities. Then it will be added
   * to the resultsData.
   * @param data to perform the filter on.
   * @returns {Array<any>} the filtered data afterwards.
   */
  public meetCriteria(data: any): any
  {
    this._resultData = new Array<any>();
    this.processData(data);

    for (let entry of data)
    {
      for (let entity of this._container.entities)
      {
        if (entry.targetNode === entity.identifier)
          this._resultData.push(entry);
      }
    }

    return this._resultData;
  }

  /**
   * Finds all media entities which totalAmount is between the min and max values.
   * @param data where the operations are performed on.
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
   * This method generates a datastructure where all media entities and their totalAmount
   * (total of all payments corresponding to this media company) are stored.
   * @param data to generate the data structure from.
   */
  private generateDataStructure(data: any): void
  {
    this._container.clearEntities();

    if (data === null || data === undefined)
      return;

    // Generating DataStructure
    for (let entry of data)
    {
      let ent = this._container.findEntity(entry.targetNode);

      if (ent === null)
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
  }

  /**
   * Is used for calculating the min and max value of the media entities totalAmounts
   * (total of all payments corresponding to this media company).
   * @param data to calculate the min and max values from.
   */
  public calculateMinMaxValues(data: any): void
  {
    this.generateDataStructure(data);

    let minValue:number = 0;
    let maxValue:number = 0;
    let first:boolean = true;

    for (let entity of this._container.entities)
    {
      let totalAmount = entity.totalAmount;

      if (first)
      {
        // minValue = totalAmount;
        maxValue = totalAmount;
        first = false;
      }

      // if (totalAmount < minValue)
      //   minValue = totalAmount;

      if (totalAmount > maxValue)
      {
        maxValue = totalAmount;
      }
    }

    // this._minValue = Math.floor(minValue);
    this._minValue = 0;
    this._maxValue = Math.ceil(maxValue);
  }

  public printData(): void
  {
    console.log('Media Value Filter: ' + this.minValue + ' / ' + this.maxValue);
  }
}
