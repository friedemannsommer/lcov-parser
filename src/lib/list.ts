interface ListNode<T> {
    next: ListNode<T> | null
    value: T
}

export default class List<T> {
    private _head: ListNode<T> | null = null
    private _tail: ListNode<T> | null = null
    private _size = 0

    public append(value: T): void {
        const newNode: ListNode<T> = {
            next: null,
            value
        }

        if (this._head === null) {
            this._head = this._tail = newNode
        } else {
            // biome-ignore lint/style/noNonNullAssertion: either head and tail are not null, or they're both null
            this._tail!.next = newNode
            this._tail = newNode
        }

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
