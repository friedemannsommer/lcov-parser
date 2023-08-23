export interface ListNode<T> {
    next: ListNode<T> | null
    value: T
}

export class List<T> {
    private _tail: ListNode<T> | null = null
    private _size: number = 0

    public insert(value: T): void {
        const node: ListNode<T> = {
            next: null,
            value
        }

        this._tail = this._tail ? (this._tail.next = node) : node
        this._size++
    }

    public remove(): T | null {
        const node = this._tail

        if (node) {
            this._tail = node.next
            this._size--

            return node.value
        }

        return null
    }

    public peek(): T | null {
        return this._tail ? this._tail.value : null
    }

    public size(): number {
        return this._size
    }
}
