import React, { useReducer, useState } from "react";
import Dropdown from 'react-dropdown';
import Calendar from 'react-calendar';

import CircuitSrc from './Graphs/Quantum_Circuit.png';


const DYN_IMG = () => {
    return(
        <img
            className="Circuit_Image"
            src = {CircuitSrc}
            alt="No quantum circuit has been ran yet"
        />
    )
}


function Dashboard(){

    const CalendarOptions = ["From","To"]; 

    const [DashboardSelected,SetDashboardSelected] = useState("ML_State");

    const Statistics_Object = {
        Selected_LR: "Classic",
        Endo: null,
        Exo: null,
        Variables:[
            "Open",
            "High",
            "Low",
            "Close",
            "Volume",
            "Trade_Count",
            "VWAP"
        ],
        LR_Models: [
            "Classic",
            "Theta",
            "OLS",
            "ARIMA"
        ],
        Order: [0,0,0],
        Seasonal_Order: [0,0,0,0]
    }

    const ML_Object = {
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
        Model_Results: null,
        NormalMethods:[
            "Logarithmic",
            "Z Score",
            "Min Max",
            "Difference"
        ],
        ChosenNormal:""
    }

    const Download_Object = {
        To: null,
        From: null,
        ToDateObject: null,
        FromDateObject: null,
        Alpaca_key: "",
        Alpaca_secret: "",
        SelectedCalendar: "From",
        Tickers: ["LMT","NVDA"],
        Temp_Ticker: "",
        Data_Payload: null,
        Datafile_Options: ["BA_data.json","BBAI_data.json","BIDU_data.json"],
        Selected_DataFile: null
    }

    const Quantum_Object = {
        OPENQASM_Script: "OPENQASM 2.0;\ninclude 'qelib1.inc';\nqreg q[4];\ncreg c[4];",
        QASM_Result: ""
    }

    function Object_Reducer (state,action){
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
                return {...state,[action.payload.key]:datelist,[action.payload.key+"DateObject"]:date};
            case "Dropdown":
                return{...state,[action.payload.key]:action.payload.target};
            case "AppendTickers":
                console.log(action.payload.target);
                return{...state,[action.payload.key]:[...action.payload.target[0],action.payload.target[1]]};
            case "API_Route":
                return{...state,[action.key]:action.payload}
            default:
                return {...state,[action.payload.key]:action.payload.target.value};
        }
    }

    const [ML_State,Set_MLState] = useReducer(Object_Reducer,ML_Object);
    const [Statistics_State,Set_StatisticsState] = useReducer(Object_Reducer,Statistics_Object);
    const [Download_State,Set_DownloadState] = useReducer(Object_Reducer,Download_Object);
    const [Quantum_State,Set_QuantumState] = useReducer(Object_Reducer,Quantum_Object);

    const ML_Router = {
        
        "SetMLArgs": `https://127.0.0.1:5000/SetMLArgs?
        Epochs=${ML_State.Epochs}
        &Batch_Size=${ML_State.Batch_Size}
        &Learning_Rate=${ML_State.Learning_Rate}
        &Window_Size=${ML_State.Window_Size}
        &Targeted_Ticker=${ML_State.Targeted_Ticker}
        &Targeted_Variable=${ML_State.Targeted_Variable}
        &Train_Ratio=${ML_State.Train_Ratio}
        &Test_Ratio=${ML_State.Test_Ratio}
        &Validation_Ratio=${ML_State.Validation_Ratio}
        &Cell_Count=${ML_State.Cell_Count}
        &Normalization_Method=${ML_State.ChosenNormal}
        `,

        "Train_Univar": `https://127.0.0.1:5000/Train_Univar`,
        "Normalize": `https:127.0.0.1:5000/Normalize?method=${ML_State.ChosenNormal}`

    }

    const Data_Router = {
        "SetDownloadArgs":`https:127.0.0.1:5000/SetDownloadArgs?Tickers=${Download_State.Tickers}
        &Alpaca_key=${Download_State.Alpaca_key}
        &Alpaca_secret=${Download_State.Alpaca_secret}
        &from=[${Download_State.From}]
        &to=[${Download_State.To}]`,

        "DownloadData":"https://127.0.0.1:5000/DownloadData",
    }

    const Statistics_Router = {
        "Set_Exo_Endo": `https://127.0.0.1:5000/Set_Exo_Endo?
        Endo=${Statistics_State.Endo}
        &Exo=${Statistics_State.Exo}
        `,
        "Set_ARIMA_Params": `https://127.0.0.1:5000/Set_ARIMA_Params?
        Order=[${Statistics_State.Order}]
        &Seasonal_Order=[${Statistics_State.Seasonal_Order}]
        `,
        "LR_Fit": `https://127.0.0.1:5000/Fit_Model?Model=${Statistics_State.Selected_LR}`,
        "LR_Predict": `https://127.0.0.1:5000/Model_Predict?Model=${Statistics_State.Selected_LR}`//will predict with exo
    }

    const Quantum_Router = {
        "QASM_Result":`https:///127.0.0.1:5000/Run_QASM?Script=${Quantum_State.OPENQASM_Script}`,
        "Grovers_Result":`https://127.0.0.1:5000/Run_Grovers`
    }

    const StateObject_Handler = (newstate,Disbatcher,SpecialCase=null) => {
        Disbatcher({
            type:SpecialCase,
            payload:newstate
        });
    }

    const DashboardNavigation = (NewDashboard) => {
        SetDashboardSelected(NewDashboard);
        RenderDashboard();
    };

    async function FetchRoute(Router,Dispatcher,RequestedRoute,state_key=null){
        try{
            const resp = await fetch(Router[RequestedRoute]);
            if (!resp.ok){
                console.error(`There was an error fetching a rout to ${RequestedRoute}`)
            }
            let data = await resp.json();
            if (Dispatcher===null){
                console.log(`No dispatcher provided, throwing out payload for ${RequestedRoute}`);
            } else {
                Dispatcher({
                    type:"API_Route",
                    payload: data.payload,
                    key: state_key
                });
            }
        } catch (err){
            console.error(`There was an error reading the response\n${err}`);
        }
    };

    async function FetchJSON(){
        try{
            const resp = await fetch(`http://localhost:3000/Assets/MarketData/${Download_State.Selected_DataFile}`);
            if (!resp.ok){
                console.error(`There was an error fetching JSON from ${Download_State.Selected_DataFile}`)
            }
            let data = await resp.json();
            StateObject_Handler({
                type:"API_Route",
                payload: data.payload
            })
        } catch (err){
            console.error(`There was an error reading the response\n${err}`);
        }
    };

    const RenderCalendar = () => {
        switch(Download_State.SelectedCalendar){
            case "From":
                return(
                    <Calendar 
                        className="DownloadFrom"
                        name="FromDateObject"
                        onChange={
                            (event)=>{
                                StateObject_Handler(
                                    {key:"From",target:event},
                                    Set_DownloadState,
                                    "Date",
                                )}}
                        value={Download_State.FromDateObject}
                    />
                )
            default:
                return(
                    <Calendar
                        className="DownloadTo"
                        name="ToDateObject"
                        onChange={
                            (event)=>{
                                StateObject_Handler(
                                    {key:"To",target:event},
                                    Set_DownloadState,
                                    "Date",
                                )}}
                        value={Download_State.ToDateObject}
                    />
                )
        }
    };


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
                            onClick={()=>{
                                FetchRoute(ML_Router,null,"SetMLArgs");
                                FetchRoute(ML_Router,Set_MLState,"Train_Univar","Model_Results");
                            }}
                            style={{top:"0",left:"0"}}
                            >Train Univariate LSTM
                        </button>
                        <button
                            className="MLOpButtons"
                            onClick={()=>{FetchRoute(ML_Router,null,"Train_Multivariate")}}
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
                                    value={ML_State[key]}
                                    onChange={
                                        (event)=>{
                                            StateObject_Handler(
                                                {key:key,target:event.target},Set_MLState,typeof ML_State[key]=="number"?"IntOnly":"null"
                                            )}
                                        }
                                    >
                                    </input>
                                </div>
                            )
                        })}
                    <Dropdown
                        className="Normalization_Method"
                        options={ML_State.NormalMethods}
                        onChange={
                            (NewNorm)=>{
                                StateObject_Handler({
                                    key:"ChosenNormal",
                                    target:NewNorm
                                },Set_MLState)
                            }
                        }
                        value={ML_State.ChosenNormal}
                        placeholder={ML_State.NormalMethods[0]}
                    />
                    </div>
                </div>)
    
            case "Statistics":
                return(
                    <div>
                        <div className="Stats_Operations">
                            <div className="Linear_Regression">
                                <h5 className="Exo_Label">Exogenous</h5>
                                <Dropdown
                                    className="Exo"
                                    options={Statistics_State.Variables.filter(_var => _var !== Statistics_State.Endo)}
                                    onChange={
                                        (NewExo)=>{
                                            StateObject_Handler(
                                                {key:"Exo",target:NewExo},
                                                Set_StatisticsState
                                            )
                                        }
                                    }
                                    value={Statistics_State.Exo}
                                    placeholder={Statistics_State.Variables[0]}
                                />
                                <h5 className="Endo_Label">Endogenous</h5>
                                <Dropdown
                                    className="Endo"
                                    options={Statistics_State.Variables.filter(_var => _var !== Statistics_State.Exo)}
                                    onChange={
                                        (NewEndo)=>{
                                            StateObject_Handler(
                                                {key:"Endo",target:NewEndo},
                                                Set_StatisticsState
                                            )
                                        }
                                    }
                                    value={Statistics_State.Endo}
                                    placeholder={Statistics_State.Variables[0]}
                                />
                                <h5 className="Selected_LR_Label">Linear Regression model</h5>
                                <Dropdown
                                    className="Selected_LR"
                                    options={Statistics_State.LR_Models}
                                    onChange={
                                        (NewModel)=>{
                                            StateObject_Handler(
                                                {key:"Selected_LR",target:NewModel},
                                                Set_StatisticsState
                                            )
                                        }
                                    }
                                    value={Statistics_State.Selected_LR}
                                    placeholder={Statistics_State.LR_Models[0]}
                                />
                                <button
                                    className="Fit_Model"
                                    onClick={
                                        ()=>{
                                            FetchRoute(Statistics_Router,"Fit_LR")
                                        }
                                    }
                                >Fit {Statistics_State.Selected_LR} model</button>
                                <button
                                    className="Model_Predict"
                                    onClick={
                                        ()=>{
                                            FetchRoute(Statistics_Router,"LR_Predict")
                                        }
                                    }
                                >Predict {Statistics_State.Selected_LR} model</button>
                            </div>
                        </div>
                    </div>
                )

            case "Quantum":
                return (
                    <>
                        <div className="QASM_editor">
                            <h4 className="QASM_Title">OPEN QASM 2.0 Editor</h4>
                            <textarea 
                            className="QASM"
                            name="OPENQASM_Script"
                            onChange={
                                (event)=>{
                                    StateObject_Handler(
                                        {key:"OPENQASM_Script",target:event.target},
                                        Set_QuantumState
                                    )}
                                }
                            value={Quantum_State.OPENQASM_Script}
                            >
                            </textarea>
                            <button
                            className="Run_QASM"
                            onClick={
                                ()=>{
                                    FetchRoute(Quantum_Router,Set_QuantumState,"QASM_Result","QASM_Result");
                                    console.log(Quantum_State.QASM_Result)
                                }
                            }
                            >Run QASM Script</button>
                            <textarea
                            className="QASM_Result"
                            name="QASM_Result"
                            value={
                                Quantum_State.QASM_Result===""?
                                "No QASM script has been ran yet":
                                `${Object.keys(Quantum_State.QASM_Result)}\n${"_ _ _ ".repeat(Object.keys(Quantum_State.QASM_Result).length)}\n\n${Object.values(Quantum_State.QASM_Result)}`
                            }
                            />
                            <button
                                className="Grovers_Algorithm"
                                onClick={
                                    ()=>{
                                        FetchRoute(Quantum_Router,Set_QuantumState,"Grovers_Result","QASM_Result")
                                    }
                                }
                            >Run Grovers algorithm</button>
                        </div>
                        <div className="Circuit_Display">
                            <DYN_IMG/>
                        </div>
                    </>
                )
    
            default:
                return(
                    <div className="Download_Dash">
                        <div className="Download_Options">
                            <div className="TickerInput">
                                <input
                                    className="Temp_Ticker"
                                    name="Temp_Ticker"
                                    value={Download_State.Temp_Ticker}
                                    onChange={
                                        (event)=>{
                                            StateObject_Handler(
                                                {key:"Temp_Ticker",target:event.target},
                                                Set_DownloadState
                                            )}
                                        }
                                />
                                <button
                                className="AppendTicker"
                                onClick={
                                    ()=>{
                                        if (Download_State.Temp_Ticker.length===3 || Download_State.Temp_Ticker.length===4){
                                            StateObject_Handler({
                                                key:"Tickers",
                                                target:[Download_State.Tickers,Download_State.Temp_Ticker]
                                            },Set_DownloadState,"AppendTickers");
                                            StateObject_Handler({
                                                key:"Temp_Ticker",
                                                target:""
                                            },Set_DownloadState);
                                        }
                                    }
                                }
                                >Add</button>
                                <textarea
                                className="CurrentTickers"
                                name="Tickers"
                                value={Download_State.Tickers}/>
                            </div>
                            <h5 className="keylabel">API key</h5>
                            <input
                            className="key"
                            name="Alpaca_key"
                            value={Download_State.Alpaca_key}
                            onChange={
                                (event)=>{
                                    StateObject_Handler(
                                        {key:"Alpaca_key",target:event.target},
                                        Set_DownloadState
                                    )}
                                }
                            ></input>
                            <h5 className="secretlabel">API secret</h5>
                            <input
                            className="secret"
                            name="Alpaca_secret"
                            value={Download_State.Alpaca_secret}
                            onChange={
                                (event)=>{
                                    StateObject_Handler(
                                        {key:"Alpaca_secret",target:event.target},
                                        Set_DownloadState
                                    )}
                                }
                            ></input>
                            <button
                            className="DownloadTickers"
                            onClick={()=>{
                                FetchRoute(Data_Router,"SetDownloadArgs");
                                FetchRoute(Data_Router,"DownloadData");
                            }}
                            >Download
                            </button>
                            <Dropdown
                                className = "Calendar_Nav"
                                options={CalendarOptions}
                                onChange={
                                    (event)=>{
                                        StateObject_Handler(
                                            {key:"SelectedCalendar",target:event.value},Set_DownloadState,"Dropdown"
                                        )}
                                    }
                                value={Download_State.SelectedCalendar}//always returns undefined
                                placeholder={CalendarOptions[0]}
                            />
                            {RenderCalendar()}
                        </div>
                        <div className="DataDisplay">
                            <Dropdown
                                className="Datafile_Nav"
                                options={Download_State.Datafile_Options}
                                onChange={
                                    ()=>{
                                        FetchJSON()
                                    }
                                }
                                value={Download_State.Selected_DataFile}
                                placeholder={Download_State.Datafile_Options[0]}
                            />
                        </div>
                    </div>
                )
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