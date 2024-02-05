import { useState } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";

export default function PaymentPage() {
  const [name, setName] = useState('');
  const [cardnumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [amountlimit, setAmountLimit] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { bookingId } = useParams();

  async function pay(ev) {
    ev.preventDefault();
    try {
      await axios.post('/payment', {
        name,
        cardnumber,
        expiry,
        cvc,
        amountlimit,
      });
      alert('Payment successful.');
      setRedirect(true);
    } catch (e) {
      alert('Payment failed. Please try again later.');
    }
  }

  if (redirect) {
    return <Navigate to={`/account/bookings/${bookingId}`} />;
  }

  return (
    <div className="mt-8 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl text-center mb-6 font-semibold">Payment</h1>
      <form onSubmit={pay}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">
            Card Holder
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Fahad Yousuf"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="cardnumber" className="block text-sm font-medium text-gray-600">
            16 Digit Card Number
          </label>
          <input
            type="text"
            id="cardnumber"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="1234 5678 9012 3456"
            value={cardnumber}
            onChange={(ev) => setCardNumber(ev.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-600">
              Expiry
            </label>
            <input
              type="text"
              id="expiry"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="12/24"
              value={expiry}
              onChange={(ev) => setExpiry(ev.target.value)}
            />
          </div>
          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-600">
              CVC Number
            </label>
            <input
              type="text"
              id="cvc"
              className="mt-1 p-2 w-full border rounded-md"
              placeholder="123"
              value={cvc}
              onChange={(ev) => setCvc(ev.target.value)}
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="amountlimit" className="block text-sm font-medium text-gray-600">
            Credit Card Limit
          </label>
          <input
            type="text"
            id="amountlimit"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="$50000"
            value={amountlimit}
            onChange={(ev) => setAmountLimit(ev.target.value)}
          />
        </div>
        <button className="bg-pink-700 text-white py-3 px-5 rounded-2xl hover:bg-pink-600 block mx-auto shadow shadow-gray-900" type="submit">
            Pay Now
        </button>
      </form>
    </div>
  );
};
