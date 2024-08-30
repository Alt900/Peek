import React, { useReducer, useState } from "react";
import Dropdown from 'react-dropdown';
import Calendar from 'react-calendar';
import { AxisOptions, Chart } from "react-charts";


function Dashboard(){

    const CalendarOptions = ["From","To"]; 

    const [DashboardSelected,SetDashboardSelected] = useState("ML_State");

    const [payload,setpayload] = useState(null);

    const DashboardObj = {
        Epochs: 100,
        Batch_Size: 32,
        Window_Size: 5,
        Learning_Rate: 0.1,
        Targeted_Ticker: "NVDA",
        Targeted_Variable: "Open",
        Train_Ratio: 0.7,
        Test_Ratio: 0.2,
        Validation_Ratio: 0.1,
        Cell_Count: 10,

        To: null,
        From: null,
        ToDateObject: null,
        FromDateObject: null,
        Alpaca_key: "",
        Alpaca_secret: "",
        SelectedCalendar: "From",
        Tickers: "[\nNVDA,\nMSFT\n]",
        payload: null,

        
        OPENQASM_Script: "OPENQASM 2.0;\ninclude 'qelib1.inc';\ncreg q[4];\ncreg c[4];"
    }

    function DashboardReducer (state,action){
        switch(action.type){
            case "IntOnly":
                const regex = /^-?\d*$/;
                if (regex.test(action.payload.target.value)){
                    return {...state,[action.payload.key]:action.payload.target.value}
                }
                return
            case "Date":
                const date = action.payload.target;
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const datelist = [year, month, day];
                return {...state,[action.payload.key]:datelist,[action.payload.key+"DateObject"]:date}
            case "Dropdown":
                return{...state,[action.payload.key]:action.payload.target}
            default:
                return {...state,[action.payload.key]:action.payload.target.value}
        }
    }

    const [DashboardState,DashboardDispatcher] = useReducer(DashboardReducer,DashboardObj);

    const API_Router = {
        
        "SetMLArgs": `https://127.0.0.1:5000/SetMLArgs?
        Epochs=${DashboardState.Epochs}
        &Batch_Size=${DashboardState.Batch_Size}
        &Learning_Rate=${DashboardState.Learning_Rate}
        &Window_Size=${DashboardState.Window_Size}
        &Targeted_Ticker=${DashboardState.Targeted_Ticker}
        &Targeted_Variable=${DashboardState.Targeted_Variable}
        &Train_Ratio=${DashboardState.Train_Ratio}
        &Test_Ratio=${DashboardState.Test_Ratio}
        &Validation_Ratio=${DashboardState.Validation_Ratio}
        &Cell_Count=${DashboardState.Cell_Count}`,

        "SetDownloadArgs":`https:127.0.0.1:5000/SetDownloadArgs?
        Tickers=${DashboardState.Tickers}
        &Alpaca_key=${DashboardState.Alpaca_key}
        &Alpaca_secret=${DashboardState.Alpaca_secret}
        &from=[${DashboardState.From}]
        &to=[${DashboardState.To}]`,

        "DownloadData":"https://127.0.0.1:5000/DownloadData"
    }

    const DashboardStateHandler = (newstate,SpecialCase=null) => {
        DashboardDispatcher({
            type:SpecialCase,
            payload:newstate
        });
    }

    const DashboardNavigation = (NewDashboard) => {
        SetDashboardSelected(NewDashboard);
        RenderDashboard();
    };



    const HandleRouter = (RequestedRout) => {
        Router(RequestedRout);
    }

    const Router = async (RequestedRout)=>{
        try{
            const resp = await fetch(API_Router[RequestedRout]);
            if (!resp.ok){
                console.error(`There was an error fetching a rout to ${RequestedRout}`)
            }
            const data = await resp.json();
            setpayload(data);
        } catch (err){
            console.log(`There was an error reading the response json\n${err}`);
        }
    };

    const RenderCalendar = () => {
        switch(DashboardState.SelectedCalendar){
            case "From":
                return(
                    <Calendar 
                        className="DownloadFrom"
                        name="FromDateObject"
                        onChange={(event)=>{DashboardStateHandler({key:"From",target:event},"Date");console.log(DashboardState.FromDateObject);}} 
                        value={DashboardState.FromDateObject}
                    />
                )
            default:
                return(
                    <Calendar
                        className="DownloadTo"
                        name="ToDateObject"
                        onChange={(event)=>{DashboardStateHandler({key:"To",target:event},"Date")}} 
                        value={DashboardState.ToDateObject}
                    />
                )
        }
    };

    function RenderAreaChart(){
        
    }


    function RenderNetworkMap(){}

    function RenderQuantumMap(){}


    //for train univariate LSTM and Multivariate LSTM 
    //the parameters side of the dashboard will contain a 
    //dropdown for what variables will be used for the 
    //univariate and multivariate LSTMs

    function RenderDashboard(){//change the color of the CSS button
        let column = 0;
        let row = -1;
        switch(DashboardSelected) {
            case "ML":
                return(
                <div>
                    <div className="ML_Operations">
                        <button 
                            className="MLOpButtons" 
                            onClick={()=>{HandleRouter("SetMLArgs")}}
                            style={{top:"0",left:"0"}}
                            >Train Univariate LSTM
                        </button>
                        <button
                            className="MLOpButtons"
                            onClick={()=>{HandleRouter("Train_Multivariate")}}
                            style={{top:"10%",left:"0"}}
                        >Train Multivariate LSTM
                        </button>
                    </div>
                    <div className="ML_Parameters">
                        {[
                        "Epochs",
                        "Batch_Size",
                        "Window_Size",
                        "Learning_Rate",
                        "Train_Ratio",
                        "Test_Ratio",
                        "Validation_Ratio",
                        "Targeted_Ticker",
                        "Targeted_Variable",
                        "Cell_Count",
                        "Output_Size"
                        ].map((key,index)=>{
                            if (index%5===0 && index!==0){
                                column += 1
                                row = -1
                            }
                            row+=1;
                            return (
                                <div className="ParameterContainer" style={{left:`${column!==0?column*30:column}%`,top:`${row*20}%`}}>
                                    <h5 className="ML_ParameterLabel">{key.replaceAll("_"," ")}</h5>
                                    <input
                                    className="ML_Input"
                                    name={key}
                                    value={DashboardState[key]}
                                    onChange={(event)=>{DashboardStateHandler({key:key,target:event.target},typeof DashboardState[key]=="number"?"IntOnly":"null")}}
                                    >
                                    </input>
                                </div>
                            )
                        })}
                    </div>
                </div>)
    
            case "Statistics":
                return(
                    <div className="Statistics_dash">
                    </div>
                )

            case "Quantum":
                return (
                    <div className="QuantumDash">
                        <div className="QASM_editor">
                            <textarea 
                            className="QASM"
                            name="OPENQASM_Script"
                            onChange={(event)=>{DashboardStateHandler({key:"OPENQASM_Script",target:event.target},"null")}}
                            value={DashboardState.OPENQASM_Script}
                            >
                            </textarea>
                            <h4 className="QASM_Title">OPEN QASM 2.0 Editor</h4>
                        </div>
                    </div>
                )
    
            default:
                return(
                    <div className="Download_Dash">
                        <Dropdown
                            className = "Calendar_Nav"
                            options={CalendarOptions}
                            onChange={(event)=>{DashboardStateHandler({key:"SelectedCalendar",target:event.value},"Dropdown",DashboardState.SelectedCalendar)}}
                            value={DashboardState.SelectedCalendar}//always returns undefined
                            placeholder={CalendarOptions[0]}
                        />
                        {RenderCalendar()}
                        <div className="Download_Options">
                            <div className="Tickers_Container">
                                <h5 className="Ticker_Label">Tickers:</h5>
                                <textarea
                                className="Tickers_Input"
                                name="Tickers"
                                onChange={(event)=>{DashboardStateHandler({key:"Tickers",target:event.target})}}
                                value={DashboardState.Tickers}
                                >
                                </textarea>
                            </div>
                            <button
                            className="DownloadTickers"
                            onClick={()=>{HandleRouter("Download_Data")}}
                            >Download
                            </button>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="Dashboard_Container">
            <div className="Tleft_Shadow"></div>
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
                >Data Download</button>
                <button 
                className="Tabs"
                onClick={()=>{
                    DashboardNavigation("Quantum")

                }}
                style={{
                    left:"30%"
                }}
                >Experimental Quantum Algorithms</button>
            </div>
            <div className="Dashboard">
                {RenderDashboard()}
            </div>
        </div>
    )
}
export default Dashboard;