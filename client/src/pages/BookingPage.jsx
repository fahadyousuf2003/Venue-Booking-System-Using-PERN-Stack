import axios from "axios";
import { differenceInCalendarDays, format } from "date-fns";
import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";
export default function BookingPage () {
    const {bookingid} = useParams();
    const [booking,setBooking] = useState(null);
    const [showAllPhotos, setShowAllPhotos] = useState(false);

    useEffect(() => {
        if(bookingid) {
            axios.get('/bookings').then(response => {
                const foundBooking = response.data.find(({bookingid}) => bookingid === bookingid);
                if (foundBooking) {
                    setBooking(foundBooking);
                }
            })
        }
    }, [bookingid])


    if (!booking) {
        return '';
    }

    if (showAllPhotos) {
        return (
            <div className="mx-auto max-w-screen-lg flex items-center justify-center">
                <div className="absolute inset-0 bg-black text-white min-h-screen">
                    <div className="bg-black p-8 grid gap-4 items-center justify-center">
                        <div>
                            <h2 className="text-3xl mr-48">Photos of {booking.title}</h2>
                            <button onClick={() => setShowAllPhotos(false)} className="fixed right-12 top-8 flex gap-1 py-2 px-4 rounded-2xl shadow shadow-black bg-white text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                                </svg>
                                Close Photos
                            </button>
                        </div> 
                        <div className="grid grid-cols-3 gap-4">
                            {booking?.photos?.length > 0 && booking.photos.map(photo => (
                                <div key={photo.filename} className="overflow-hidden h-64 w-64">
                                    <img className="h-full w-full object-cover" src={`http://localhost:4000/uploads/${photo.filename}`} alt="" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="my-8">
            <h1 className="text-3xl">{booking.title}</h1>
            <a className="flex gap-1 my-3 block font-semibold underline" target="_blank" href={'https://maps.google.com/?q=' + booking.address}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {booking.address}
                </a>
                <div className="bg-gray-200 p-4 mb-4 rounded-2xl">
                   <h2 className="text-xl">Your Booking Information</h2>
                   <div className={"flex gap-1 mb-2 mt-4 text-gray-500"}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                  {differenceInCalendarDays(new Date(booking.checkout), new Date(booking.checkin))} nights:
                  <div className="flex gap-1 items-center ml-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                    </svg>
                    {format(new Date(booking.checkin), 'yyyy-MM-dd')}
                  </div>
                  &rarr;
                  <div className="flex gap-1 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                    </svg>
                    {format(new Date(booking.checkout), 'yyyy-MM-dd')}
                  </div>
                </div>
                <div className=" flex justify-center bg-primary p-2 text-black font-bold rounded-2xl">
                    Total price = ${booking.price}
                </div>
                </div>
                <div className="relative">
                    <div className="grid gap-2 grid-cols-[2fr_1fr] rounded-3xl overflow-hidden">
                        <div>
                            {booking.photos?.[0] && (
                                <div className="">
                                    <img onClick={() => {setShowAllPhotos(true)}} className="aspect-square cursor-pointer object-cover" src={`http://localhost:4000/uploads/${booking.photos[0].filename}`} alt="" />
                                </div>
                            )}
                        </div>
                        <div className="grid">
                            {booking.photos?.[1] && (
                                <div className="">
                                    <img onClick={() => {setShowAllPhotos(true)}} className="aspect-square cursor-pointer object-cover" src={`http://localhost:4000/uploads/${booking.photos[1].filename}`} alt="" />
                                </div>
                            )}
                            <div className="overflow-hidden">
                                {booking.photos?.[2] && (
                                    <div className="">
                                        <img onClick={() => {setShowAllPhotos(true)}} className="aspect-square cursor-pointer object-cover relative top-2" src={`http://localhost:4000/uploads/${booking.photos[2].filename}`} alt="" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAllPhotos(true)}
                        className="flex gap-2 absolute bottom-2 right-2 py-2 px-4 bg-white rounded-2xl shadow shadow-md shadow-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                        Show more photos
                    </button>
                </div>    
        </div>
    );
}