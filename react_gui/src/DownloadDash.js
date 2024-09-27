import React, { useEffect, useReducer, useState } from "react";
import Dropdown from 'react-dropdown';
import Calendar from 'react-calendar';
import { Object_Reducer, FetchRoute, StateObject_Handler, BarChart } from "./utils";


function DownloadDash({state,dispatcher}){

    const CalendarOptions = ["From","To"]; 

    const [DownloadedData,SetDownloadedData] = useState([{ name: 'No data loaded'}]);

    let Datafile_Options = state.Tickers

    const Data_Router = {
        "SetDownloadArgs":`https:127.0.0.1:5000/SetDownloadArgs?Tickers=${state.Tickers}
        &Alpaca_key=${state.Alpaca_key}
        &Alpaca_secret=${state.Alpaca_secret}
        &from=[${state.From}]
        &to=[${state.To}]`,

        "DownloadData":"https://127.0.0.1:5000/DownloadData",
    }

    async function FetchJSON(){
        try{
            const resp = await fetch(`https://127.0.0.1:5000/FetchJSON?ticker=${state.Selected_DataFile}`);
            if (!resp.ok){
                console.error(`There was an error fetching JSON from ${state.Selected_DataFile}`)
            }
            console.log(resp);
            const data = await resp.json();
            SetDownloadedData([...data.payload]);
        } catch (err){
            console.error(`There was an error reading the response\n${err}`);
        }
    }

    const RenderCalendar = () => {
        switch(state.SelectedCalendar){
            case "From":
                return(
                    <Calendar 
                        className="DownloadFrom"
                        name="FromDateObject"
                        onChange={
                            (event)=>{
                                StateObject_Handler(
                                    {key:"From",target:event},
                                    dispatcher,
                                    "Date",
                                )}}
                        value={state.FromDateObject}
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
                                    dispatcher,
                                    "Date",
                                )}}
                        value={state.ToDateObject}
                    />
                )
        }
    };

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
                                    {key:"Temp_Ticker",target:event.target},
                                    dispatcher
                                )}
                            }
                    />
                    <button
                    className="AppendTicker"
                    onClick={
                        ()=>{
                            if (state.Temp_Ticker.length===3 || state.Temp_Ticker.length===4){
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
                    <textarea
                    className="CurrentTickers"
                    name="Tickers"
                    value={state.Tickers}/>
                    <div className="CurrentTickers_BackShadow"/>
                </div>
                <h5 className="keylabel">API key:</h5>
                <input
                className="key"
                name="Alpaca_key"
                value={state.Alpaca_key}
                onChange={
                    (event)=>{
                        StateObject_Handler(
                            {key:"Alpaca_key",target:event.target},
                            dispatcher
                        )}
                    }
                ></input>
                <h5 className="secretlabel">API secret:</h5>
                <input
                className="secret"
                name="Alpaca_secret"
                value={state.Alpaca_secret}
                onChange={
                    (event)=>{
                        StateObject_Handler(
                            {key:"Alpaca_secret",target:event.target},
                            dispatcher
                        )}
                    }
                ></input>
                <button
                className="DownloadTickers"
                onClick={()=>{
                    FetchRoute(Data_Router,null,"SetDownloadArgs");
                    FetchRoute(Data_Router,null,"DownloadData")
                }}
                >Download
                </button>
                <Dropdown
                    className = "Calendar_Nav"
                    options={CalendarOptions}
                    onChange={
                        (event)=>{
                            StateObject_Handler(
                                {key:"SelectedCalendar",target:event.value},dispatcher,"Dropdown"
                            )}
                        }
                    value={state.SelectedCalendar}
                    placeholder={CalendarOptions[0]}
                />
                {RenderCalendar()}
            </div>
            <div className="DataDisplay">
                <Dropdown
                    className="Datafile_Nav"
                    options={Datafile_Options}
                    onChange={
                        (event)=>{
                            StateObject_Handler(
                                {key:"Selected_DataFile",target:event.value},dispatcher,"Dropdown"
                            );
                        }
                    }
                    value={state.Selected_DataFile}
                    placeholder={Datafile_Options[0]}
                />
                <button
                className="Data_Render"
                onClick={()=>{
                    FetchJSON();
                    //const vals = DownloadedData.flatMap(item=>["open","high","low"].map(key=>item[key]));
                    StateObject_Handler(
                        {key:"currently_rendered",target:state.Selected_DataFile},dispatcher,"Dropdown"
                    );
                }}
                >Render Chart Data</button>
                <h3 className="Display_Label">{state.currently_rendered} Candlestick</h3>
                <div className="ChartContainer">
                    <BarChart data={DownloadedData}/>
                </div>
            </div>
        </div>
    )
};

export default DownloadDash;