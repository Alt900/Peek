import React, { useState } from "react";

import StatisticsDash from "./StatisticsDash";
import MLDash from "./MLDash";
import DownloadDash from "./DownloadDash";
import QuantumDash from "./QuantumDash";

function Dashboard(){

    const [DashboardSelected,SetDashboardSelected] = useState("ML");

    const DashboardNavigation = (NewDashboard) => {
        SetDashboardSelected(NewDashboard);
        RenderDashboard();
    };

    function RenderDashboard(){
        switch(DashboardSelected) {
            case "ML":
                return(<MLDash/>)
            case "Statistics":
                return(<StatisticsDash/>)
            case "Quantum":
                return (<QuantumDash/>)
            default:
                return(<DownloadDash/>)
        }
    }
    
    return (
        <div className="Dashboard_Container">
            <div className="Dashboard_Shadow"></div>
            <div className="TabsContainer">
                <button 
                className="Tabs"
                onClick={()=>{DashboardNavigation("ML")}}
                style={{
                    left:"0"
                }}
                >Machine Learning</button>
                <button 
                className="Tabs"
                onClick={()=>{DashboardNavigation("Statistics")}}
                style={{
                    left:"10%",
                }}
                >Statistics</button>
                <button 
                className="Tabs"
                onClick={()=>{DashboardNavigation("Download")}}
                style={{
                    left:"20%"
                }}
                >Data</button>
                <button 
                className="Tabs"
                onClick={()=>{
                    DashboardNavigation("Quantum")

                }}
                style={{
                    left:"30%"
                }}
                >Quantum</button>
            </div>
            <div className="Dashboard">
                {RenderDashboard()}
            </div>
        </div>
    )
}
export default Dashboard;