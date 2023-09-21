let mongoose = require('mongoose')

let movies = mongoose.model("movies" , {
    movieName: {type: String , required: true},
    movieGenre: {type: String , required: true},
    moviePhoto: {type: String , required: true},
    movieCaption: {type: String , required: true},
    movieIndustry: {type: String , required: true},
})

module.exports = {movies}