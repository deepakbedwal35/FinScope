import {Routes , Route , BrowserRouter} from "react-router-dom";
import {useEffect , useState} from 'react';
import {userApi} from "./services/api";
import tailwind from "tailwindcss";

// import ProtectRoute 
import {Toaster} from "react-hot-toast"
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import Watchlist from "./pages/Watchlist.jsx";

import StockDetails from "./pages/StockDetails.jsx";
// import Fundamentals from "./features/Fundamentals.jsx";
import FullScan from "./pages/FullScan.jsx";
import Backtesting from "./pages/Backtesting.jsx";
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import ProtectRoute from "./layouts/ProtectRoute.jsx";
import BuyButton from "./features/BuyButton.jsx"
import {useAuth} from "./context/AuthContext.jsx"

import AdminPage from "./pages/AdminPage.jsx";
import Recommendation from "./pages/Recommendation.jsx";
import PatternsStock from "./pages/PatternsStock.jsx";
// import LoginDemo from "./pages/LoginDemo.jsx"
// import Rootlayout from "./layouts/Rootlayout.jsx"
import LandingRoute from "./layouts/LandingRoute.jsx";


function App() {
  
  const {isAuthenticated , loading} = useAuth();
 
  return (
    <>
    
    <Toaster position="top-center" />
    
      <Routes> 
         {/* <Route path="/" element= {<Landing/>}/> */}
       {/* <Route element = {<ProtectRoute isAuthenticated={!isAuthenticated} loading={loading}  />}> */}
        {/* Public Routes */}
        <Route path="/login" element = {<Login />}/>
        <Route path="/signup" element = {<Signup/>}/>
        <Route path = "/admin/page" element ={<AdminPage/>}/>
        {/* </Route> */}
        {/* Private Routes */}
         <Route path="/" element={<LandingRoute isLoggedIn={isAuthenticated} />} />

        <Route element = {<ProtectRoute isAuthenticated={isAuthenticated} loading={loading}  />}>
          {/* <Route  element = {<Rootlayout/>}> */}
          <Route path="/backtest" element = {<Backtesting/>}/>
          <Route path="/home" element = {<Home/>}/>
          <Route path="/watchlist" element = {<Watchlist/>}/>
         
          <Route path="/analyse/:symbol" element = {<StockDetails/>}/>
          
          <Route path="/fullscan" element = {<FullScan/>}/>
          <Route path="/fin/recommendations" element = {<Recommendation/>}/>
          <Route path= "/buy/:symbol" element={<BuyButton/>}/>
          <Route path= "/all/patterns" element={<PatternsStock/>}/>

       
         </Route>
        {/* </Route> */}
        

        {/* <Route path "*" element = {<Navigate to/>}/> */}
      </Routes>
   
    </>
   
  )
}


export default App;



