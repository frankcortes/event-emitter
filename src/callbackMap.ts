import { LinkedListNode, LinkedList } from './linkedList';
import { fn } from './types';

export class CallbackMap {

  // HashMap with callback instances group by callback
  // since you can do add(fn) more than once and execute
  // twice
  data: Record<string, Array<LinkedListNode<string>>>;

  // As far you cannot create unique function instances as keys in
  // your object, (toString does not work since it's the same for
  // const a = function() {} and const b = function() {} even if
  // a !== b), we will generate and assign an unique identifier for
  // every function.
  identifiers: Record<string, { callback: fn, references: number }>;

  // LinkedList with every callback to execute
  executionList: LinkedList<string>;

  constructor() {
    this.data = {}
    this.identifiers = {};
    this.executionList = new LinkedList();
  }

  private getCallbackId(callback: fn): string {
    const stringified = callback.toString();
    let expectedIdentifier;
    let i = 0;

    // Callbacks with same code can be different instances.
    // i.e. given const a = function() {} and const b = function() {}
    // where a !== b
    // we need to generate two different keys, one for "a" and another
    // for "b"
    while (expectedIdentifier = this.identifiers[`${stringified}--${i}`]) {
      if (callback === expectedIdentifier.callback) {
        return `${stringified}--${i}`;
      }
      i++;
    }

    // In case it's a new one, let's create one.
    return `${stringified}--${i}`;

  }

  add(callback: fn) {
    // callback is serialized to be a valid key for hashmap
    const callbackKey = this.getCallbackId(callback);

    if (!this.data[callbackKey]) {
      this.data[callbackKey] = [];
      this.identifiers[callbackKey] = {
        callback, // The original function instance
        references: 0, // Number of times this callback appears
      };
    }

    const nodeToBeAdded = this.executionList.add(callbackKey);

    this.data[callbackKey].push(nodeToBeAdded);

    // Increment a new reference for this callback.
    this.identifiers[callbackKey].references++;
  }

  remove(callback: fn) {
    // callback is serialized to be a valid key for hashmap
    const callbackKey = this.getCallbackId(callback);

    if (this.data[callbackKey]) {
      const nodeToBeRemoved = this.data[callbackKey].pop();

      // nodeToBeRemoved is with '!' since cannot be undefined
      this.executionList.removeNode(nodeToBeRemoved!);

      // Decrease in one a new reference for this callback.
      this.identifiers[callbackKey].references--;

      // If there is no references for this callback, we can remove this identifier.
      if (!this.identifiers[callbackKey]) {
        delete this.identifiers[callbackKey];
      }
    }

  }

  // With these params, execute every function inside of the callback.
  run(...args: any[]) {
    let node: (LinkedListNode<string> | undefined) = this.executionList.head;

    while (node = node.next) {
      const identifier = this.identifiers[node.value!];

      identifier.callback(...args);

    }

  }

  log(): void {
    const callbacksLog = Object.entries(this.data).map(([key, value]) => [key, value.map(() => '*')]);
    const executionListLog = this.executionList.log();
    const identifiersLog = Object.keys(this.identifiers);
    console.log(`callbacks: ${callbacksLog}, linkedList: ${executionListLog}`,
      `identifiers: ${identifiersLog}`);
  }

}
