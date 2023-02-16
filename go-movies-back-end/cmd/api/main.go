package main

import (
	"fmt"
	"log"
	"net/http"
)

const port = 3336

type application struct {
	Domain string
}

func main() {
	//set apllication config
	var app application

	//read from command line

	//connect to the database
	app.Domain = "example.com"
	log.Println("starting application on port", port)

	//start a web server
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), app.routes())
	if err != nil {
		log.Fatal(err)
	}

}