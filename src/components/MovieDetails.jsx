/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import Loader from "./Loader";

export default function MovieDetails({ App_key, selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // checking if the selected movie is in the watched list
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const currentMovieRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

  // destructuring the movie object for ease of use
  // renaming properties & selecting the ones we need
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ")[0]),
      userRating,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  // Using escape key to close movie details
  useEffect(
    function () {
      // the callback fn must be the same one reference in both adding
      // and removing the event listener
      function callback(e) {
        if (e.code === "Escape") {
          onCloseMovie();
          //console.log("closed");
        }
      }

      document.addEventListener("keydown", callback);

      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [onCloseMovie]
  );

  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const res = await fetch(`http://www.omdbapi.com/?apikey=${App_key}&i=${selectedId}`);
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId, App_key]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      // clean up fn
      return function () {
        document.title = "Film Hunt";
      };
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} Imdb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <StarRating maxRating={10} size={24} onSetRating={setUserRating} />
              ) : (
                <p>You rated this movie with {currentMovieRating}⭐</p>
              )}

              {userRating > 0 && (
                <button className="btn-add" onClick={handleAdd}>
                  + Add
                </button>
              )}
            </div>

            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Direct by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
