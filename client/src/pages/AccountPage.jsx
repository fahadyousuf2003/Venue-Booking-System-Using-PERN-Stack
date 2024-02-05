import { useContext, useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
import PlacesPage from "./PlacesPage";
import AccountNav from "../AccountNav";

export default function AccountPage() {
  const [ redirect, setRedirect ] = useState(null);
  const { ready, user , setUser} = useContext(UserContext);

  let { subpage } = useParams();
  if (subpage === undefined) {
    subpage = 'profile';
  }

  async function logout() {
    await axios.post('/logout');
    setUser(null);
    localStorage.removeItem('user');
    setRedirect('/');
  }
  console.log('Ready state:', ready);

  if (!ready) {
    console.log('Not ready, displaying Loading...');
    return 'Loading...';
  }

  if (ready && !user && !redirect) {
    console.log('Ready, but no user, navigating to /login');
    return <Navigate to={'/login'} />;
  }

  

  console.log('Rendering account page for', user?.name);

  if(redirect) {
    return <Navigate to={redirect} />
  }
  return (
    <div>
     <AccountNav />
      {subpage === 'profile' && (
        <div className="text-center max-w-lg mx-auto">
            Logged in as {user.name} ({user.email}) <br />
            <button onClick={logout} className="primary max-w-sm mt-2">Logout</button>
        </div>
      )}
      {subpage === 'places' && (
        <PlacesPage />
      )}
    </div>
  );
}
