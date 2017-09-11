export default class TimeFormat {

    private static func: (raw: string) => string = passThrough;

    public static format(raw: string): string {
        return TimeFormat.func(raw);
    }

    public static formatNumber(raw: number): string {
        return TimeFormat.func(raw.toString());
    }

    public static setFormat(header: string) {
        if (header === 'Quarter') {
            TimeFormat.func = function (raw: string): string {
                return raw.substr(0, 4) + ' Q' + raw.substr(-1);
            };
            console.log('set to a quarter format');
        } else {
            TimeFormat.func = passThrough;
            console.log('set to default format');
        }
    }
}

function passThrough(raw: string): string {
    return raw;
}
