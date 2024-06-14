export default class ByteMatch {
    public readonly size: number
    private _offset = 0

    public constructor(private readonly _buffer: number[]) {
        this.size = _buffer.length
    }

    public compare(value: number): boolean {
        if (this._offset >= this.size) {
            this._offset = 0
        }

        const matched = this._buffer[this._offset] === value

        if (matched) {
            this._offset++
        }

        return matched
    }

    public matched(): boolean {
        return this._offset === this.size
    }

    public reset(): void {
        this._offset = 0
    }
}
