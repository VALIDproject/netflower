import * as d3 from 'd3';

const inFormatMonth = d3.time.format('%Y%m');
const outFormatMonth = d3.time.format('%b %Y');

export default class TimeFormat {

    private static func: (raw: string) => string = passThrough;
    private static revt: (raw: string) => string = passThrough;

    public static format(raw: string): string {
      if (raw === null || raw === undefined) {
        return;
      }
      return TimeFormat.func(raw);
    }

    public static reverseFormat(raw: string): string {
        if (raw === null || raw === undefined) {
          return;
        }
        return TimeFormat.revt(raw);
      }

      public static formatNumber(raw: number): string {
        return TimeFormat.func(raw.toString());
    }

    /**
     * formats multiple selected time values to a pretty string
     * considering that the selection might be non-contiguous.
     * @param selected
     * @param allPossible
     */
    public static formatMultiple(selected: string[], allPossible: string[]): string {
        if (selected.length === 1) {
            return TimeFormat.format(selected[0]);
        // } else if (raw.length === 0) {
        //     return '';
        } else {
            let result = '';
            let start = '';
            let end = '';
            for (const possible of allPossible) {
                if (selected.indexOf(possible) >= 0) {
                    if (start.length > 0) {
                        // middle or end of interval
                        end = possible;
                    } else {
                        // single or start of interval
                        start = possible;
                        end = possible;
                    }
                } else {
                    if (start.length > 0) {
                        // after the end of interval
                        if (result.length > 0) {
                            result += ', ';
                        }
                        result += TimeFormat.format(start);
                        if (start !== end) {
                            result += '-' + TimeFormat.format(end);
                        }
                        start = '';
                    } else {
                        // middle of hole --> nothing to do
                    }
                }
            }
            if (start.length > 0) {
                // after the end of interval
                if (result.length > 0) {
                    result += ', ';
                }
                result += TimeFormat.format(start);
                if (start !== end) {
                    result += '-' + TimeFormat.format(end);
                }
            }
            return result;
        }
    }


      /**
     * configures time format based on column name of time column.
     * Currently supports 'quarter' and 'month' and checks if these strings are contained in the column name.
     * The default is to pass-through the raw value, which works well for e.g. 'year'.
     * @param header
     */
    public static setFormat(header: string) {
        if (header.match(/quarter/i)) {
            TimeFormat.func = function (raw: string): string {
                return raw.substr(0, 4) + ' Q' + raw.substr(-1);
            };
            TimeFormat.revt = function (formated: string): string {
                return formated.replace(' Q', '');
            };
        } else if (header.match(/month/i)) {
            TimeFormat.func = function (raw: string): string {
                const date = inFormatMonth.parse(raw); // returns a Date
                return outFormatMonth(date);
            };
            TimeFormat.revt = function (formated: string): string {
                const date = outFormatMonth.parse(formated); // returns a Date
                return inFormatMonth(date);
            };
        } else {
            TimeFormat.func = passThrough;
        }
    }
}

function passThrough(raw: string): string {
    return raw;
}
