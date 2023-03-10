import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import Input from "./form/Input";
import Select from "./form/Select";
import TextArea from "./form/TextArea";
import CheckBox from "./form/Checkbox";
import Swal from "sweetalert2";

const EditMovie = () => {
    const navigate = useNavigate();

    const { jwtToken } = useOutletContext();

    const [error, setError] = useState(null);
    const [errors, setErrors] = useState([]);
    const [movie, setMovie] = useState({
        id: 0,
        title: "",
        release_date: "",
        runtime: "",
        mpaa_rating: "",
        description: "",
        genres: [],
        genres_array: [Array(13).fill(false)],
    });

    const mpaaOptions = [
        { id: "G", value: "G" },
        { id: "PG", value: "PG" },
        { id: "PG13", value: "PG13" },
        { id: "R", value: "R" },
        { id: "NC17", value: "NC17" },
        { id: "18A", value: "18A" },
    ]
    const hasError = (key) => {
        return errors.indexOf(key) !== -1;
    }

    let { id } = useParams();
    if (id === undefined) {
        id = 0;
    }

    useEffect(() => {
        if (jwtToken === "") {
            navigate("/login");
            return;
        }

        if (id === 0) {
            setMovie({
                id: 0,
                title: "",
                release_date: "",
                runtime: "",
                mpaa_rating: "",
                description: "",
                genres: [],
                genres_array: [Array(13).fill(false)],
            })
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            const requestOptions = {
                method: "GET",
                headers: headers,
            }
            fetch(`${import.meta.env.VITE_API_URL}/genres`, requestOptions)
                .then((response) => response.json())
                .then((data) => {
                    const checks = [];
                    data.forEach(g => checks.push({ id: g.id, checked: false, genre: g.genre }));
                    setMovie(m => ({ ...m, genres: checks, genres_array: [] }));
                })
                .catch(err => console.log(err));
        } else {
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", "Bearer " + jwtToken);
            const requestOptions = {
                method: "GET",
                headers: headers,
            }
            fetch(`${import.meta.env.VITE_API_URL}/admin/movies/${id}`, requestOptions)
                .then((response) => {
                    if (response.status !== 200) {
                        setError("Invalid response code: " + response.status);
                    }
                    return response.json();
                })
                .then((data) => {
                    data.movie.release_date = new Date(data.movie.release_date).toISOString().split('T')[0];

                    const checks = [];
                    data.genres.forEach(g => {
                        if (data.movie.genres_array.indexOf(g.id) !== -1) {
                            checks.push({ id: g.id, checked: true, genre: g.genre });
                        } else {
                            checks.push({ id: g.id, checked: false, genre: g.genre });
                        }
                    });
                    setMovie({ ...data.movie, genres: checks });
                })
                .catch(err => console.log(err));
        }


    }, [id, jwtToken])

    const handleSubmit = (event) => {
        event.preventDefault();

        let errors = [];
        let required = [
            { field: movie.title, name: "title" },
            { field: movie.release_date, name: "release_date" },
            { field: movie.runtime, name: "runtime" },
            { field: movie.description, name: "description" },
            { field: movie.mpaa_rating, name: "mpaa_rating" },
        ];

        required.forEach(function (obj) {
            if (obj.field === "") {
                errors.push(obj.name)
            }
        });

        if (movie.genres_array.length === 0) {
            Swal.fire({
                title: "Error!",
                text: "You must choose at least one genre",
                icon: "error",
                confirmButtonText: "Ok"
            })
            errors.push("genres");
        }

        setErrors(errors);
        if (errors.length > 0) {
            return false;
        }

        //passed validation, save changes
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + jwtToken);

        const method = movie.id > 0 ? "PUT" : "POST";

        const requestBody = movie;
        //need to convert the values in JSON fo realase date (to date) and for runtime to int
        requestBody.release_date = new Date(movie.release_date);
        requestBody.runtime = +movie.runtime;

        const requestOptions = {
            body: JSON.stringify(requestBody),
            method: method,
            headers: headers,
            credentials: "include",
        }

        fetch(`${import.meta.env.VITE_API_URL}/admin/movies/${movie.id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    navigate("/manage-catalogue");
                }
            }).catch((error) => console.log(error));
    }

    const handleChange = (event) => {
        let value = event.target.value;
        let name = event.target.name;
        setMovie({ ...movie, [name]: value });
    }

    const handleCheck = (event, position) => {
        let tempArr = movie.genres;
        tempArr[position].checked = !tempArr[position].checked;
        let tempIDs = movie.genres_array;
        if (!event.target.checked) {
            tempIDs.splice(tempIDs.indexOf(event.target.value));
        } else {
            tempIDs.push(parseInt(event.target.value, 10));
        }
        setMovie({ ...movie, genres_array: tempIDs })
    }

    if (error !== null) {
        return <div>Error:{error.message}</div>
    }

    return (
        <div>
            <h2 className="text-center">Add/Edit Movie</h2>
            <hr />
            {/* <pre>{JSON.stringify(movie, null, 3)}</pre> */}
            <form onSubmit={handleSubmit}>
                <input type="hidden" name="id" value={movie.id} id="id" />
                <Input
                    title="Title"
                    className="form-control"
                    type="text"
                    name="title"
                    value={movie.title}
                    onChange={handleChange}
                    errorDiv={hasError("title") ? "text-danger" : "d-none"}
                    errorMsg={"Please enter a title"} />
                <Input
                    title="Relase Date"
                    className="form-control"
                    type="date"
                    name="release_date"
                    value={movie.release_date}
                    onChange={handleChange}
                    errorDiv={hasError("release_date") ? "text-danger" : "d-none"}
                    errorMsg={"Please enter a release date"} />
                <Input
                    title="Runtime"
                    className="form-control"
                    type="text"
                    name="runtime"
                    value={movie.runtime}
                    onChange={handleChange}
                    errorDiv={hasError("runtime") ? "text-danger" : "d-none"}
                    errorMsg={"Please enter a runtime"} />
                <Select
                    title="MPAA Rating"
                    name="mpaa_rating"
                    options={mpaaOptions}
                    value={movie.mpaa_rating}
                    onChange={handleChange}
                    placeHolder="Chose..."
                    errorMsg="Please choose"
                    errorDiv={hasError("mpaa_rating") ? "text-danger" : "d-none"}
                />
                <TextArea
                    title="Description"
                    name="description"
                    value={movie.description}
                    rows="3"
                    onChange={handleChange}
                    errorMsg="Please enter a description"
                    errorDiv={hasError("description") ? "text-danger" : "d-none"}
                />
                <hr />
                <h3>Genres</h3>
                {movie && movie.genres && movie.genres.length > 1 &&
                    <>
                        {Array.from(movie.genres).map((g, index) => (
                            <CheckBox
                                title={g.genre}
                                name="genre"
                                key={index}
                                id={"genre-" + index}
                                onChange={(event) => handleCheck(event, index)}
                                value={g.id}
                                checked={movie.genres[index].checked}
                            />
                        ))}
                    </>

                }
                <hr />
                <button className="btn btn-primary">Save</button>
            </form>
        </div>)
}

export default EditMovie;