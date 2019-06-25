import React from "react";
import { navigate } from "@reach/router";

import { getMe } from "../services/user";

const UserStateContext = React.createContext();
const UserDispatchContext = React.createContext();

function reducer(_, action) {
  switch (action.type) {
    case "LOGIN": {
      return action.payload;
    }
    case "LOGOUT": {
      return null;
    }
    default: {
      throw new Error(`Invalid action type ${action.type}`);
    }
  }
}

function getFromLocalStorage() {
  const storedState = localStorage.getItem("user");
  if (storedState) return JSON.parse(storedState);
  return null;
}

function UserProvider({ children }) {
  const [user, dispatch] = React.useReducer(reducer, getFromLocalStorage());

  React.useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  React.useEffect(() => {
    if (!user) {
      getMe()
        .then(userData => {
          if (userData) dispatch({ type: "LOGIN", payload: userData });
        })
        .catch(error => {
          console.error(error);
          navigate("/");
        });
    }
  }, [user, dispatch]);

  return (
    <UserStateContext.Provider value={user}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUser() {
  return React.useContext(UserStateContext);
}

function useUserUpdater() {
  return React.useContext(UserDispatchContext);
}

export { UserProvider, useUser, useUserUpdater };
