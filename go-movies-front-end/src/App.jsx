import { useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom'
import Alert from './components/Alert';
import './globalStyle/globalStyle.css'

function App() {

  const [jwtToken, setJwtToken] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertClassName, setAlertClassName] = useState("d-none");
  const [ticketInterval, setTicketInterval] = useState();

  const navigate = useNavigate();

  const logOut = () => {
    const requestOptions = {
      method: "GET",
      credentials: "include"
    }
    fetch(`${import.meta.env.VITE_API_URL}/logout`, requestOptions)
      .catch(error => console.log("error logging out", error))
      .finally(() => {
        setJwtToken("");
        toggleRefresh(false);
      });
    navigate("login");
  }

  const toggleRefresh = useCallback((status) => {
    if (status) {
      const i = setInterval(() => {
        const requestOptions = {
          method: 'GET',
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          }
        }
        console.log(requestOptions);
        fetch(`${import.meta.env.VITE_API_URL}/refresh`, requestOptions)
          .then((response) => response.json())
          .then((data) => {
            if (data.access_token) {
              setJwtToken(data.access_token);
            }
          }).catch((error) => console.log("user is not logged in"));
      }, 600000)
      setTicketInterval(i);
    } else {
      setTicketInterval(null);
      clearInterval(ticketInterval);
    }

  }, [ticketInterval]);

  useEffect(() => {
    if (jwtToken === "") {
      const requestOptions = {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json"
        }
      }
      fetch(`${import.meta.env.VITE_API_URL}/refresh`, requestOptions)
        .then((response) => response.json())
        .then((data) => {
          if (data.access_token) {
            setJwtToken(data.access_token);
            toggleRefresh(true);
          }
        }).catch((error) => console.log("user is not logged in"));
    }
  }, [jwtToken, toggleRefresh])

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h1>Go Watch a Movie!</h1>
        </div>
        <div className="col text-end">
          {jwtToken === ""
            ? <Link to="/login"><span className="badge bg-success">Login</span></Link>
            : <a href="#!" onClick={logOut}><span className='badge bg-danger'>Logout</span></a>
          }
        </div>
        <hr className="mb-3"></hr>
      </div>
      <div className="row">
        <div className="col-md-2">
          <nav>
            <div className="list-group">
              <Link to="/" className="list-group-item list-group-item-action">Home</Link>
              <Link to="/movies" className="list-group-item list-group-item-action">Movies</Link>
              <Link to="/genres" className="list-group-item list-group-item-action">Genres</Link>
              {jwtToken !== "" && <>
                <Link to="admin/movie/0" className="list-group-item list-group-item-action">Add Movie</Link>
                <Link to="/manage-catalogue" className="list-group-item list-group-item-action">Manage Catalogue</Link>
                <Link to="/graphql" className="list-group-item list-group-item-action">GraphQL</Link>
              </>}
            </div>
          </nav>
        </div>
        <div className="col-md-10">
          <Alert message={alertMessage} className={alertClassName} />
          <Outlet context={{ jwtToken, setJwtToken, setAlertClassName, setAlertMessage, toggleRefresh }} />
        </div>
      </div>
    </div >
  )
}

export default App
