import React, { useEffect, useState } from "react";
import { FetchRoute, StateObject_Handler, Dropdown, FetchJSON, CandleStickChart} from "./utils";

let Today = new Date();
let Current_Year = Today.getFullYear();
let Current_Month = Today.getMonth()+1;
const Year_Options = Array.from({length:Current_Year-2000+1},(_,year)=>2000+year);
const Month_Options = [1,2,3,4,5,6,7,8,9,10,11,12];

function DownloadDash({state,dispatcher}){
    let Datafile_Options = state.Tickers

    const [Selected_DataFile,SetSelected_DataFile] = useState(state.Tickers[0]);
    const [StartYear,SetStartYear] = useState(Current_Year);
    const [EndYear,SetEndYear] = useState(Current_Year);
    const [StartMonth,SetStartMonth] = useState(Current_Month);
    const [EndMonth,SetEndMonth] = useState(Current_Month);
    const [StartDay,SetStartDay] = useState(1);
    const [EndDay,SetEndDay] = useState(1);

    const [LevelController,SetLevelController] = useState(.8);
    const [ZoomController,SetZoomController] = useState(1.0);
    const [ScrollSensitivityController,SetScrollSensitivityController]= useState(1.5);

    const Data_Router = {
        "DownloadData":`/DownloadData?Tickers=${state.Tickers}&from=${StartYear}-${StartMonth}-${StartDay}&to=${EndYear}-${EndMonth}-${EndDay}`,
    }


    const [Start_Day_Options,SetStart_Day_Options] = useState(Array.from({length:new Date(StartYear,StartMonth,0).getDate()},(_,day)=>day+1));
    const [End_Day_Options,SetEnd_Day_Options] = useState(Array.from({length:new Date(StartYear,StartMonth,0).getDate()},(_,day)=>day+1));
    
    useEffect(()=>{
        SetStart_Day_Options(Array.from({length:new Date(StartYear,StartMonth,0).getDate()},(_,day)=>day+1))
    },[StartMonth]);

    useEffect(()=>{
        SetEnd_Day_Options(Array.from({length:new Date(EndYear,EndMonth,0).getDate()},(_,day)=>day+1))
    },[EndMonth]);
    
    return(
        <div className="Download_Dash">
            <div className="Download_Options">
                <div className="TickerInput">
                    <input
                        className="Temp_Ticker"
                        name="Temp_Ticker"
                        value={state.Temp_Ticker}
                        onChange={
                            (event)=>{
                                StateObject_Handler(
                                    {
                                        key:"Temp_Ticker",target:event.target
                                    },
                                    dispatcher
                                )}
                            }
                    />
                    <button
                    className="AppendTicker"
                    onClick={
                        ()=>{
                            if (state.Temp_Ticker.length>=2){
                                StateObject_Handler({
                                    key:"Tickers",
                                    target:[state.Tickers,state.Temp_Ticker]
                                },dispatcher,"AppendTickers");
                                StateObject_Handler({
                                    key:"Temp_Ticker",
                                    target:""
                                },dispatcher);
                            }
                        }
                    }
                    >Add</button>
                    <button
                    className="RemoveTicker"
                    onClick={
                        ()=>{
                            if (state.Temp_Ticker.length>=2){
                                StateObject_Handler({
                                    key:"Tickers",
                                    target:[state.Tickers,state.Temp_Ticker]
                                },dispatcher,"RemoveTickers");
                                StateObject_Handler({
                                    key:"Temp_Ticker",
                                    target:""
                                },dispatcher);
                            }
                        }
                    }
                    >Remove</button>
                    <textarea
                    className="CurrentTickers"
                    name="Tickers"
                    value={state.Tickers}/>
                    <div className="CurrentTickers_BackShadow"/>
                </div>
                <div className="DateSelectionContainer">
                    <div className="StartDateContainer">
                        <h4 style={{position:"absolute",top:"0",left:"0",height:"40%",color:"var(--primary_color)"}}>Starting YYYY-MM-DD</h4>
                        <div style={{position:"absolute",left:"0",width:"33%",height:"48%",bottom:"0"}}>
                            <Dropdown
                                Options={Year_Options}
                                State={StartYear}
                                Dispatcher={SetStartYear}
                            />
                        </div>
                        <div style={{position:"absolute",left:"33%",width:"33%",height:"48%",bottom:"0"}}>
                            <Dropdown
                                Options={Month_Options}
                                State={StartMonth}
                                Dispatcher={SetStartMonth}
                            />
                        </div>
                        <div style={{position:"absolute",left:"66%",width:"33%",height:"48%",bottom:"0"}}>
                            <Dropdown
                                Options={Start_Day_Options}
                                State={StartDay}
                                Dispatcher={SetStartDay}
                            />
                        </div>
                    </div>
                    <div className="EndDateContainer">
                        <h4 style={{position:"absolute",top:"0",left:"0",height:"40%",color:"var(--primary_color)"}}>End YYYY-MM-DD</h4>
                        <div style={{position:"absolute",left:"0",width:"33%",height:"48%",bottom:"0"}}>
                            <Dropdown
                                Options={Year_Options}
                                State={EndYear}
                                Dispatcher={SetEndYear}
                            />
                        </div>
                        <div style={{position:"absolute",left:"33%",width:"33%",height:"48%",bottom:"0"}}>
                            <Dropdown
                                Options={Month_Options}
                                State={EndMonth}
                                Dispatcher={SetEndMonth}
                            />
                        </div>
                        <div style={{position:"absolute",left:"66%",width:"33%",height:"48%",bottom:"0"}}>
                            <Dropdown
                                Options={End_Day_Options}
                                State={EndDay}
                                Dispatcher={SetEndDay}
                            />
                        </div>
                    </div>
                </div>
                <button
                className="DownloadTickers"
                onClick={()=>{
                    FetchRoute(null,Data_Router["DownloadData"]);
                }}
                >Download
                </button>
            </div>
            <div className="DataDisplay">
                <div style={{position:"absolute",right:"0",height:"5%",width:"100%"}}>
                    <Dropdown
                        Options={Datafile_Options}
                        State={Selected_DataFile}
                        Dispatcher={SetSelected_DataFile}
                    />
                </div>
                <button
                className="Data_Render"
                onClick={()=>{
                    FetchJSON(Selected_DataFile,dispatcher);
                }}
                >Render Chart Data</button>
                <h3 className="Display_Label">{Selected_DataFile} Candlestick</h3>
                <input 
                    className="LevelControl"
                    type="range"
                    min={0}
                    max={8}
                    step={.01}
                    value={LevelController}
                    onChange={(e)=>SetLevelController(parseFloat(e.target.value))}
                ></input>
                <h3 className="LevelControlLabel">
                X Axis Level</h3>
                <input 
                    className="ZoomControl"
                    type="range"
                    min={.5}
                    max={2.0}
                    step={.01}
                    value={ZoomController}
                    onChange={(e)=>SetZoomController(parseFloat(e.target.value))}
                ></input>
                <h3 className="ZoomControlLabel">
                Y Axis Zoom</h3>
                <input 
                    className="SensitivityControl"
                    type="range"
                    min={1.0}
                    max={4.0}
                    step={.01}
                    value={ScrollSensitivityController}
                    onChange={(e)=>SetScrollSensitivityController(parseFloat(e.target.value))}
                ></input>
                <h3 className="ScrollSensitivityLabel">
                Scroll Sensitivity</h3>
                <CandleStickChart data={state.Cached_JSON} XAxisSensitivity={ScrollSensitivityController} Leveling={LevelController} Zoom={ZoomController}/>
            </div>
        </div>
    )
}

export default DownloadDash;