declare type TvKey = { [key: string]: number };

declare const SamsungAPI: {
    tvKey: TvKey,
    eventName: string,
    disableKey: (keyCode: string|number) => void,
    disableKeys: (keyCodes: (string|number)[]) => void,
    isSamsungTv: () => boolean,
    getMacAddress: (formatted?: boolean) => string
};