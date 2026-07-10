type Task<T> = () => Promise<T>

export class ValidationQueue {
  private readonly concurrency: number
  private active = 0
  private queue: Array<() => void> = []

  constructor(concurrency = 1) {
    this.concurrency = Math.max(1, concurrency)
  }

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(() => {
        this.active += 1
        task()
          .then(resolve)
          .catch(reject)
          .finally(() => {
            this.active -= 1
            this.drain()
          })
      })
      this.drain()
    })
  }

  private drain() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const run = this.queue.shift()
      run?.()
    }
  }
}
