/**
 * Created by Florian on 13.02.2018.
 */
/**
 * This class is used to describe a filter by the time aspect of the data.
 */
export default class TimeFilter
{
  private resultData: Array<any>;
  private timePoints: string[];
  private _minValue: number;
  private _maxValue: number;

  constructor()
  {
    this.resultData = new Array<any>();
  }

  get minValue(): number
  {
    return this._minValue;
  }

  get maxValue(): number
  {
    return this._maxValue;
  }

  public meetCriteria(data: any, timePoints: string[]): any
  {
    // Store the time points locally
    this.timePoints = timePoints;

    // Convert array of strings to array of numbers and find min and max
    const timePointsNumbers = timePoints.map(Number);
    this._minValue = Math.min(...timePointsNumbers);
    this._maxValue = Math.max(...timePointsNumbers);

    // Filter the array of data by the right time points and return it
    this.resultData = data.filter((e) => {
      return timePoints.indexOf(e.timeNode) > -1;
    });
    return this.resultData;
  }

  public printData(): void
  {
    console.log('Time Filter: ' + this.timePoints.join(','));
  }
}
