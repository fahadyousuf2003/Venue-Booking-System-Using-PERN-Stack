import { useEffect, useState } from "react";
import Perks from "../Perks";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

export default function PlacesFormPage () {
    const {placeid} = useParams();
    const [title,setTitle] = useState('');
    const [address,setAddress] = useState('');
    const [addedPhotos,setAddedPhotos] = useState([]);
    const [photoLink,setPhotoLink] = useState('');
    const [description,setDescription] = useState('');
    const [perks,setPerks] = useState([]);
    const [extrainfo,setExtraInfo] = useState('');
    const [checkin,setCheckIn] = useState('');
    const [checkout,setCheckOut] = useState('');
    const [maxguests,setMaxGuests] = useState(1);
    const [price,setPrice] = useState(100);
    const [redirect,setRedirect] = useState(false);
    
    useEffect(() => {
        if(!placeid) {
            return;
        }
        axios.get('/places/'+placeid).then(response => {
            const {data} = response;
            setTitle(data.title);
            setAddress(data.address);
            const filenames = data.photos.map(photo => photo.filename);
            setAddedPhotos(filenames);
            setDescription(data.description);
            setPerks(data.perks);
            setExtraInfo(data.extrainfo);
            setCheckIn(data.checkin);
            setCheckOut(data.checkout);
            setMaxGuests(data.maxguests);
            setPrice(data.price);
        });
    }, [placeid]);

    function inputHeader(text){
        return(
            <h2 className="text-2xl mt-4">{text}</h2>
        );
    }
    function inputDescription(text){
        return(
            <p className="text-gray-500 text-sm">{text}</p>
        );
    }
    function preInput(header,description){
        return(
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        );
    }
    async function addPhotoByLink(ev){
        ev.preventDefault();
        const {data:filename} = await axios.post('/upload-by-link', {link:photoLink});
        setAddedPhotos(prev => {
            return [...prev, filename];
        });
        setPhotoLink('');
    }
    function uploadPhoto(ev){
        const files = ev.target.files;
        const data = new FormData();
        for (let i = 0; i<files.length; i++) {
            data.append('photos', files[i]);
        }
        axios.post('/upload', data, {
            headers: {'Content-type':'multipart/form-data'}
        }).then(response => {
            const {data:filenames} = response;
            setAddedPhotos(prev => {
                return [...prev, ...filenames];
            });
        })
    }
    async function savePlace(ev) {
        ev.preventDefault();
    
        const photosArray = addedPhotos.map(filename => ({ filename }));
        const placeData = {
            title,
            address,
            photos: photosArray,
            description,
            perks,
            extrainfo,
            checkin,
            checkout,
            maxguests,
            price,
            placeid, // include placeid in the request body
        };
    
        try {
            let response;
    
            if (placeid) {
                // Update place
                response = await axios.put('/places', placeData);
            } else {
                // New place
                response = await axios.post('/places', placeData);
            }
    
            console.log('Place saved:', response.data);
            setRedirect(true);
        } catch (error) {
            console.error('Error saving place:', error);
        }
    }
    

    if(redirect) {
        return <Navigate to={'/account/places'} />
    }

    function removePhoto (ev,filename) {
        ev.preventDefault();
        setAddedPhotos([...addedPhotos.filter(photo => photo !== filename)]);
    }

    function selectAsMainPhoto (ev,filename) {
        ev.preventDefault();
        setAddedPhotos([filename,...addedPhotos.filter(photo => photo !== filename)]);
    }

    return (
        <div>
        <AccountNav />
        <form onSubmit={savePlace}>
            {preInput('Title','Title for your place should be short and catchy as in advertisement')}
            <input type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="title, for example: My lovely apartment"/>
            {preInput('Address','address to your place')}
            <input type="text" value={address} onChange={ev => setAddress(ev.target.value)} placeholder="address"/>
            {preInput('Photos','more = better')}
            <div className="flex gap-2">
                <input type="text" value={photoLink} 
                                    onChange={ev => setPhotoLink(ev.target.value)} 
                                    placeholder={'Add using a link ..... jpg (Add atleast six photos)'}/>
                <button onClick={addPhotoByLink} className="bg-gray-200 px-4 rounded-2xl">Add&nbsp;Photo</button>
            </div>
            <div className="mt-2 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {addedPhotos.length > 0 && addedPhotos.map(link => (
                <div className="h-32 flex relative" key={link}>
                    <img className="rounded-2xl w-full object-cover" src={`http://localhost:4000/uploads/${link}`} alt="" />
                    <button onClick={ev => removePhoto(ev,link)} className="cursor-pointer absolute bottom-1 right-1 text-white bg-black bg-opacity-50 rounded-2xl py-2 px-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                    <button onClick={ev => selectAsMainPhoto(ev,link)} className="cursor-pointer absolute bottom-1 left-1 text-white bg-black bg-opacity-50 rounded-2xl py-2 px-3">
                        {link === addedPhotos[0] && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>                          
                        )}
                        {link !== addedPhotos[0] && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                            </svg>
                        )}
                        
                    </button>
                </div>
            ))}
                <label className="h-32 cursor-pointer flex items-center gap-1 justify-center border bg-transparent rounded-2xl p-2 text-2xl text-gray-600">
                    <input type="file" multiple className="hidden" onChange={uploadPhoto}/>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    Upload
                </label>
            </div>
            {preInput('Description','description of the place')}
            <textarea value={description} 
                        onChange={ev => setDescription(ev.target.value)} />
            {preInput('Perks','select all the perks of your place')}
            <Perks selected={perks} onChange={setPerks} />
            {preInput('Extra Info','house rules, etc')}
            <textarea value={extrainfo} 
                        onChange={ev => setExtraInfo(ev.target.value)} />
            {preInput('Check in, Check out Time','add check in and check out times, remember to have some time window for cleaning the room between guests')}
            <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                <div>
                    <h3 className="mt-2 -mb-1">Check in time</h3>
                    <input type="text" value={checkin} 
                                        onChange={ev => setCheckIn(ev.target.value)} placeholder="14:00"/> 
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Check out time</h3>
                    <input type="text" value={checkout} 
                                        onChange={ev => setCheckOut(ev.target.value)} placeholder="11:00"/>
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Max number of Guests</h3>
                    <input type="number" value={maxguests} 
                                        onChange={ev => setMaxGuests(ev.target.value)}/>
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Price per night</h3>
                    <input type="number" value={price} 
                                        onChange={ev => setPrice(ev.target.value)}/>
                </div>
            </div>
            <div>
                <button type="submit" className="primary my-4">Save</button>
            </div>
        </form>
    </div>
    );
}