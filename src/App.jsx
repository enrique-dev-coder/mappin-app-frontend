import { useState ,useEffect} from 'react';
import ReactMapGL,{Marker,Popup} from 'react-map-gl';
import {NewReleases, Room,Star} from "@material-ui/icons"
import "./app.css"
import axios from 'axios';
import {format} from "timeago.js"
import Register from './components/Register';
import Login from "./components/Login"

function App() {
  const myStorage = window.localStorage
  const [currentUser,setCurrentUser] = useState(myStorage.getItem("user"))
  const [pins, setPins] = useState([])
  const [currentPlaceId, setCurrentPlaceId] = useState(null)
  const [newPlace, setNewPlace] = useState(null)
  const [title, setTitle] = useState(null)
  const [desc, setDesc] = useState(null)
  const [rating, setRating] = useState(0)
  const[showRegister,setShowRegister]= useState(false)
  const[showLogin,setShowLogin]= useState(false)
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 25.67,
    longitude: -100.30,
    zoom: 12
  });
//solo apra pasar como parametro el id y centrar el pin en la pantalla
 const handleMarkerClick =(id,lat,long)=>{
  setCurrentPlaceId(id);
  setViewport({
    ...viewport,latitude:lat,longitude:long
  })
 }

 const handleAddClick=(e)=>{
  const [long,lat]= e.lngLat;
  setNewPlace({
    lat,
    long,
  })
 }

 const handleSubmit= async (e)=>{
  e.preventDefault();
  const newPin={
    username:currentUser,
    title,
    desc,
    rating,
    lat:newPlace.lat,
    long:newPlace.long
  }
  try {
    const res = await axios.post("/pins",newPin)
    setPins([...pins,res.data])
    setNewPlace(null)
  } catch (error) {
    console.log(error)
  }
 }

 const handleLogout=()=>{
   myStorage.removeItem("user");
   setCurrentUser(null)
 }


  useEffect(() => {
    const getPins = async ()=>{
      try {
        const res = await axios.get("/pins");
        setPins(res.data);
      } catch (error) {
        console.log(error)
      }
    };  
    getPins()
  }, [])
  return (
    <div className="App">
      <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX} //aqui va tu token de mapbox
      onViewportChange={nextViewport => setViewport(nextViewport)}
      mapStyle="mapbox://styles/safak/cknndpyfq268f17p53nmpwira"
      onDblClick={handleAddClick}
      transitionDuration="200"
    >
      {pins.map((p)=>(
        <>
        <Marker 
          latitude={p.lat} 
          longitude={p.long}
          offsetLeft={-viewport.zoom*3.5} 
          offsetTop={-viewport.zoom*5}
        >
          <Room 
            style ={{fontSize:viewport.zoom *5,color: p.username === currentUser ? "tomato":"royalblue" ,cursor:"pointer"}}
            onClick={()=>handleMarkerClick(p._id,p.lat,p.long)}
          />
        </Marker>
        {p._id === currentPlaceId && (
                   <Popup
                   latitude={p.lat}
                   longitude={p.long}
                   closeButton={true}
                   closeOnClick={false}
                   onClose={()=>setCurrentPlaceId(null)}
                   anchor="bottom" >
                   <div className="card">
                     <label htmlFor="">Place</label>
                     <h4 className="place">{p.title}</h4>
                     <label htmlFor="">Review</label>
                     <p className="description">{p.desc}</p>
                     <label htmlFor="">Rating</label>
                       <div className="star_container">
                          {Array(p.rating).fill(<Star style={{color:'gold'}}/>)}
                       </div>
                     <label htmlFor="">Information</label>
                     <span className= "username">Created by <b>{p.username}</b></span>
                     <span className= "date">{format(p.createdAt)}</span>
                   </div>
                 </Popup> 
          )}
         </> 
      ))}
               {newPlace && (
                 <>
                <Popup
                  latitude={newPlace.lat}
                  longitude={newPlace.long}
                  closeButton={true}
                  closeOnClick={false}
                  onClose={()=>setNewPlace(null)}
                  anchor="bottom" >
                  <div>
                    <form onSubmit={handleSubmit}>
                      <label htmlFor="">Title</label>
                     <input placeholder="Enter a title" onChange={e=>setTitle(e.target.value)}/>
                      <label htmlFor="">Review</label>
                      <textarea placeholder="tell us something about this place" onChange={e=>setDesc(e.target.value)}></textarea>
                      <label htmlFor="">Rating</label>
                      <select onChange={e=>setRating(e.target.value)}>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      <button className="submitButton" type="submit">Add Pin</button>
                    </form> 
                  </div>
                </Popup>
                </>
               )}
               {currentUser ? 
               (<button className="button logout" onClick={handleLogout}>Log out</button>):
               (
                <div className="buttons">
                  <button className="button login" onClick={()=>setShowLogin(true)}>Login</button>
                  <button className="button register"  onClick={()=>setShowRegister(true)}>Register</button>
                </div>
               )}
               {showRegister && <Register setShowRegister={setShowRegister}/>}
               {showLogin && <Login setShowLogin = {setShowLogin} myStorage={myStorage} setCurrentUser={setCurrentUser}/>}
    </ReactMapGL>
    </div>
  );
}

export default App;
