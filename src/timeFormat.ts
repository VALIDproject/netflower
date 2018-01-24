import * as d3 from 'd3';

const inFormatMonth = d3.time.format('%Y%m');
const outFormatMonth = d3.time.format('%b %Y');

export default class TimeFormat {

    private static func: (raw: string) => string = passThrough;

    public static format(raw: string): string {
      if (raw === null || raw === undefined) {
        return
      }
      return TimeFormat.func(raw);
    }

    public static formatNumber(raw: number): string {
        return TimeFormat.func(raw.toString());
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
        } else if (header.match(/month/i)) {
            TimeFormat.func = function (raw: string): string {
                const date = inFormatMonth.parse(raw); // returns a Date
                return outFormatMonth(date);
            };
        } else {
            TimeFormat.func = passThrough;
        }
    }
}

function passThrough(raw: string): string {
    return raw;
}
