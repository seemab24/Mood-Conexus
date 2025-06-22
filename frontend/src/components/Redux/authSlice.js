import { createSlice } from "@reduxjs/toolkit";

// Helper function to load initial state from localStorage
const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("authState");
    if (serializedState === null) {
      return {
        user: { name: "", email: "" },
        isAuthenticated: false,
        token: "",
      }; // Initial state if nothing is in localStorage
    }
    return JSON.parse(serializedState);
  } catch (e) {
    return {
      user: { name: "", email: "" },
      isAuthenticated: false,
      token: "",
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadFromLocalStorage(),
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.token = token;

      // Save the updated state to localStorage
      localStorage.setItem("authState", JSON.stringify(state));
    },
    logout: (state) => {
      state.user = { name: "", email: "" };
      state.isAuthenticated = false;
      state.token = "";

      // Remove state from localStorage
      localStorage.removeItem("authState");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;






// import { createSlice } from "@reduxjs/toolkit";

// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     user: {
//       name: "",
//       email: "",
//     },
//     isAuthenticated: false,
//     token: "", 
//   },
//   reducers: {
//     loginSuccess: (state, action) => {
//       const { user, token } = action.payload; 
//       state.user = user; 
//       state.isAuthenticated = true; 
//       state.token = token;
//     },
//     logout: (state) => {
//       state.user = { name: "", email: "" }; 
//       state.isAuthenticated = false; 
//       state.token = ""; 
//     },
//   },
// });

// export const { loginSuccess, logout } = authSlice.actions;
// export default authSlice.reducer;
