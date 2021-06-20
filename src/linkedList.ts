export class LinkedListNode<T> {
  prev: LinkedListNode<T> | undefined;
  next: LinkedListNode<T> | undefined;
  value: T | undefined;

  constructor(value?: T) {
    this.value = value;
  }

}

export class LinkedList<T> {
  head: LinkedListNode<T>;
  tail: LinkedListNode<T>;

  constructor() {
    // First element is blank
    this.head = new LinkedListNode();
    this.tail = this.head;
  }

  add(node: T): LinkedListNode<T> {
    const oldTail = this.tail;

    oldTail.next = new LinkedListNode(node);
    // New element is the latest one
    this.tail = oldTail.next;
    this.tail.prev = oldTail;
    // Return the new node
    return this.tail;
  }

  removeNode(linkedListnode: LinkedListNode<T>) {
    const { prev, next } = linkedListnode;
    if (prev) {
      prev.next = next;
    }
    if (next) {
      next.prev = prev;
    }
  }

  log(): string {
    let currentNode: (LinkedListNode<T> | undefined) = this.head;
    let log = '';
    log = 'HEAD -> ';
    while (currentNode = currentNode.next) {
      log += `${currentNode.value} -> `;
    }
    log += 'NULL';

    return log;
  }
}




