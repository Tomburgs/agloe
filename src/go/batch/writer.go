package batch

type Writer interface {
	Write(batch []interface{})
}

type WriterFunc func(batch []interface{})

func (w WriterFunc) Write(batch []interface{}) {
	w(batch)
}
