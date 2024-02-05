// BookingWidget.jsx
import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function BookingWidget({ place }) {
  const [checkin, setCheckIn] = useState('');
  const [checkout, setCheckOut] = useState('');
  const [numberofguests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [redirect, setRedirect] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkin && checkout) {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    numberOfNights = differenceInCalendarDays(checkoutDate, checkinDate);
  }

  async function bookThisPlace() {
    try {
      console.log('User Email:', user ? user.email : 'N/A');
      console.log('User ID:', user ? user.userid : 'N/A');
      console.log('Place Owner ID:', place.ownerid);
      
      const userIdResponse = await axios.get(`/user-id/${user.email}`);
      const userId = userIdResponse.data.userid;
      if (user && place.ownerid === userId) {
        alert("You cannot book your own accommodation.");
        return;
      }
      
      const response = await axios.post('/bookings', {
        checkin,
        checkout,
        numberofguests,
        name,
        phone,
        place: place.placeid,
        price: numberOfNights * place.price,
      });

      console.log('Booking Response:', response.data);

      const bookingId = response.data.bookingid;
      setRedirect(`/paymentpage/${bookingId}`);
    } catch (error) {
      console.error('Error booking the place:', error);
    }
  }

  if (redirect) {
    return <Navigate to={redirect} />;
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Price: ${place.price} / per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className="py-3 px-4">
            <label>Check in:</label>
            <input
              type="date"
              value={checkin}
              onChange={(ev) => setCheckIn(ev.target.value)}
            />
          </div>
          <div className="py-3 px-4 border-l">
            <label>Check out:</label>
            <input
              type="date"
              value={checkout}
              onChange={(ev) => setCheckOut(ev.target.value)}
            />
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Number of Guests:</label>
          <input
            type="number"
            value={numberofguests}
            onChange={(ev) => setNumberOfGuests(Number(ev.target.value))}
          />
        </div>
        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your Full Name:</label>
            <input
              type="text"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <label>Phone Number:</label>
            <input
              type="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
            />
          </div>
        )}
      </div>
      <button onClick={bookThisPlace} className="primary mt-4">
        Reserve
        {numberOfNights > 0 && (
          <span> ${numberOfNights * place.price}</span>
        )}
      </button>
    </div>
  );
}
