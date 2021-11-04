package batch

import (
	"time"
)

type Batcher struct {
    w Writer
    size int
    interval time.Duration
    lastCommit time.Time
    batch []interface{}
}

func NewBatcher(writer Writer, size int, interval time.Duration) *Batcher {
    return &Batcher{
        w: writer,
        size: size,
        interval: interval,
        lastCommit: time.Now(),
    }
}

func (b *Batcher) Write(data interface{}) {
    b.batch = append(b.batch, data)

    if !b.isSizeReached() && !b.isIntervalExpired() {
        return
    }

    b.Commit()
}

func (b *Batcher) isSizeReached() bool {
    return len(b.batch) >= b.size
}

func (b *Batcher) isIntervalExpired() bool {
    return b.interval != 0 && time.Since(b.lastCommit) < b.interval
}

func (b *Batcher) Commit() {
    if len(b.batch) == 0 {
        return
    }

    b.w.Write(b.batch)
    b.lastCommit = time.Now()
    b.batch = nil
}
