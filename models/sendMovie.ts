let mongoose = require("mongoose") 

let videoMovies = mongoose.model('videoMovies' , {
    movieName: {type: String , required: true},
    movieLanguage: {type: String , required: true},
    movieQuality: {type: String , required: true},
    movieId: {type: String , required: true},
    movieCaption: {type: String , required: true}
})

module.exports = {videoMovies}