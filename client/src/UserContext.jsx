import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data...');
        const storedUser = JSON.parse(localStorage.getItem('user'));
  
        if (storedUser) {
          setUser(storedUser);
        } else {
          const response = await axios.get('http://localhost:4000/profile');
          const data = response.data;
          console.log('Received user data:', data);
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        localStorage.removeItem('user');
      } finally {
        setReady(true);
      }
    };
  
    fetchUserData();
  }, [setUser, setReady]);
  

  useEffect(() => {
    console.log('Ready state changed:', ready);
  }, [ready]);

  return (
    <UserContext.Provider value={{ user, setUser, ready}}>
      {children}
    </UserContext.Provider>
  );
}
