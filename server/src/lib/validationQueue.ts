type Task<T> = () => Promise<T>

interface QueueItem<T> {
  task: Task<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

export class ValidationQueue {
  private readonly concurrency: number
  private active = 0
  private queue: QueueItem<unknown>[] = []

  constructor(concurrency = 1) {
    this.concurrency = Math.max(1, concurrency)
  }

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.drain()
    })
  }

  private drain() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const item = this.queue.shift() as QueueItem<unknown>
      this.active += 1
      item.task()
        .then(result => item.resolve(result))
        .catch(err => item.reject(err))
        .finally(() => {
          this.active -= 1
          this.drain()
        })
    }
  }
}
