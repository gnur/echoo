package main

import (
	_ "embed"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"time"
)

type response struct {
	Hostname string
	Time     time.Time
	Name     string
	Boot     time.Time
}

//go:embed index.html
var index []byte

var name string
var boot time.Time

func indexHandler(w http.ResponseWriter, r *http.Request) {

	w.Write(index)
}

func apiHandler(w http.ResponseWriter, r *http.Request) {

	h, err := os.Hostname()
	if err != nil {
		h = "unknown"
	}
	slog.Info("request", "name", name)

	resp := response{
		Hostname: h,
		Time:     time.Now(),
		Name:     name,
		Boot:     boot,
	}

	js, err := json.Marshal(resp)
	if err != nil {
		slog.Error("failed to marshal json", "error", err)
	}

	w.Write(js)
}

func main() {
	boot = time.Now()
	name = GetRandomName()
	slog.Info("starting", "name", name)
	mux := http.NewServeMux()

	mux.HandleFunc("/", indexHandler)
	mux.HandleFunc("/api", apiHandler)

	http.ListenAndServe(":8080", mux)
}
