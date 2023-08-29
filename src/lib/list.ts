interface ListNode<T> {
    next: ListNode<T> | null
    value: T
}

export default class List<T> {
    private _head: ListNode<T> | null = null
    private _tail: ListNode<T> | null = null
    private _size: number = 0

    public insert(value: T): void {
        const lastNode = this._tail
        const node: ListNode<T> = {
            next: null,
            value
        }

        if (lastNode !== null) {
            lastNode.next = node
        }

        if (this._head === null) {
            this._head = node
        }

        this._tail = node
        this._size++
    }

    public remove(): T | null {
        const firstNode = this._head

        if (firstNode !== null) {
            this._head = firstNode.next
            this._size--

            if (this._tail === firstNode) {
                this._tail = null
            }

            return firstNode.value
        }

        return null
    }

    public peek(): T | null {
        return this._head !== null ? this._head.value : null
    }

    public size(): number {
        return this._size
    }
}
