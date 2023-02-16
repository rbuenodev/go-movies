import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const Movie = () => {
    const [movie, setMovie] = useState({});
    const { id } = useParams();

    useEffect(() => {
        let myMovie = {
            id: 1,
            title: "highlander",
            relase_date: "1986-03-07",
            runtime: 116,
            mpaa_rating: "R",
            description: "Some long description"
        }
        setMovie(myMovie);
    }, [id]);

    return (<div className="text-center">
        <h2>Movie: {movie.title}</h2>
        <small><em>{movie.relase_date}, {movie.runtime} minutes, Rated {movie.mpaa_rating}</em></small>
        <hr />
        <p>{movie.description} </p>
    </div>)
}

export default Movie;