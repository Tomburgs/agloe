package bitmask

type Bitmask map[uint64]uint64

func NewBitmask() Bitmask {
	return Bitmask(make(map[uint64]uint64))
}

func (b Bitmask) Set(value int64) {
	val := uint64(value)
	index, mask := val/64, val%64

	b[index] |= (1 << mask)
}

func (b Bitmask) Has(value int64) bool {
	val := uint64(value)
	index, mask := val/64, val%64

	return (b[index] & (1 << mask)) != 0
}
