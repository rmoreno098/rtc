package pocketbase

import (
	"github.com/pocketbase/pocketbase"
)

func NewPocketBase() *pocketbase.PocketBase {
	return pocketbase.New()
}
