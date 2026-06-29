import React from "react"
import {Outlet} from "react-router-dom"
import Header from "../components/Header/Header"
export default function Rootlayout(){
    return(
        <>
        <Header/>
        <div className=" min-h-screen bg-neutral-900">
            <Outlet/>
        </div>
        </>
    )
}