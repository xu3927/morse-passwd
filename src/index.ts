type TConfig = {
    target?: HTMLElement | string;
    passwd: string;
    pressLeastTime?: number;
    expires?: number;
    success?(): void;
    fail?(): void;
    expire?(): void;
    input?(inp: string): void;
}

enum TYPE_MAP {
    DOT = 'dot',
    DASH = 'dash'
}
const TYPE_VALUE_MAP = {
    [TYPE_MAP.DOT]: '.',
    [TYPE_MAP.DASH]: '_'
}

const defaultConfig: TConfig = {
    // the target element which will bind event
    target: window.document.querySelector('body') as HTMLElement,
    // the passwd. '.' represents one click, '_' represents one press
    passwd: '.._.._',
    // how long time press should be counted. the unit is ms
    pressLeastTime: 1000,
    // how long time will the current operation expired, then you should do it from the first code again. the unit is ms
    expires: 1000 * 6,
    // the callback if the passwd is right.
    success() {
        console.log('Passwd Right!')
    },
    fail() {
        console.log('Passwd Wrong!')
    },
    // the callback if the operation is expired.
    expire() {
        console.log('The operation is expired, please do it again.')
    }
}


class InnerMorsePass {
    constructor(config: TConfig) {
        this.config = Object.assign({}, defaultConfig, config)
        let element: any = config.target
        if (typeof config.target === 'string') {
            element = document.querySelector(config.target)
        }
        if (!element) {
            throw new Error('the target element was ' + element)
        }
        this.element = element;
        if (typeof this.config.pressLeastTime === 'number') {
            this.pressLeastTime = this.config.pressLeastTime
        }
        if (typeof this.config.expires === 'number') {
            this.expires = this.config.expires
        }
        if (!/^[._]+$/.test(this.config.passwd)) {
            throw new Error('the passwd should only contain . and _');
        }
        this.passwd = this.config.passwd;
        this.init()
    }
    element: HTMLElement = document.querySelector('body') as HTMLElement
    config: TConfig
    pressLeastTime = 1500
    passwd = '.._..'
    steps = ['.', '.', '_', '.', '.']
    mousedownTime = Number.MAX_SAFE_INTEGER;
    expireTimer = -1;
    expires = 6000;
    init() {
        this.reset()
        this.bindListeners()
    }
    clickHandler = () => {
        this.run(TYPE_MAP.DOT)
    }
    mousedownHandler = () => {
        this.mousedownTime = new Date().getTime();
    }
    mouseupHandler = () => {
        if (new Date().getTime() - this.mousedownTime > this.pressLeastTime) {
            this.run(TYPE_MAP.DASH)
        } else {
            this.run(TYPE_MAP.DOT)
        }
    }
    bindListeners() {
        this.element.addEventListener('mousedown', this.mousedownHandler)
        this.element.addEventListener('mouseup', this.mouseupHandler)
    }
    removeListeners() {
        this.element.removeEventListener('mousedown', this.mousedownHandler)
        this.element.removeEventListener('mouseup', this.mouseupHandler)
    }
    run(type: `${TYPE_MAP}`) {
        window.clearTimeout(this.expireTimer)
        this.expireTimer = window.setTimeout(() => {
            this.expire()
        }, this.config.expires);

        if (this.steps[0] === TYPE_VALUE_MAP[type]) {
            this.next()
        } else {
            this.fail()
        }
        this.input()
    }
    next() {
        this.steps.shift()
        if (this.steps.length === 0) {
            this.success()
        }
    }
    reset() {
        window.clearTimeout(this.expireTimer)
        this.steps = this.passwd.split('')
    }
    success() {
        window.clearTimeout(this.expireTimer)
        if (typeof this.config.success === 'function') {
            this.config.success()
        }
        this.removeListeners()
    }
    fail() {
        window.clearTimeout(this.expireTimer)
        if (typeof this.config.fail === 'function') {
            this.config.fail()
        }
    }
    input() {
        if (typeof this.config.input === 'function') {
            this.config.input(this.passwd.slice(0, this.passwd.length - this.steps.length))
        }
    }
    destroy() {
        window.clearTimeout(this.expireTimer)
        this.removeListeners()
    }
    expire() {
        this.fail()
        this.reset()
        if (typeof this.config.expire === 'function') {
            this.config.expire()
        }
    }
}

class MorsePass {
    constructor(config: TConfig) {
        this.morsePass = new InnerMorsePass(config);
    }
    morsePass: InnerMorsePass
    destroy() {
        this.morsePass.destroy()
    }
}

export default MorsePass;
