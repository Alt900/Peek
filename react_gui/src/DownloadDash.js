import React, { useReducer, useState } from "react";
import Dropdown from 'react-dropdown';
import Calendar from 'react-calendar';
import { Object_Reducer, FetchRoute, StateObject_Handler } from "./utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';


function DownloadDash(){

    const CalendarOptions = ["From","To"]; 

    const [DownloadedData,SetDownloadedData] = useState([{ name: 'No data loaded'}]);

    const [MinMax,SetMinMax] = useState([0,0]);

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
        Selected_DataFile: "LMT"
    }

    const [Download_State,Set_DownloadState] = useReducer(Object_Reducer,Download_Object);

    let Datafile_Options = Download_State.Tickers

    const Data_Router = {
        "SetDownloadArgs":`https:127.0.0.1:5000/SetDownloadArgs?Tickers=${Download_State.Tickers}
        &Alpaca_key=${Download_State.Alpaca_key}
        &Alpaca_secret=${Download_State.Alpaca_secret}
        &from=[${Download_State.From}]
        &to=[${Download_State.To}]`,

        "DownloadData":"https://127.0.0.1:5000/DownloadData",
    }

    async function FetchJSON(){
        try{
            const resp = await fetch(`http://localhost:3000/Assets/MarketData/${Download_State.Selected_DataFile}_data.json`);
            if (!resp.ok){
                console.error(`There was an error fetching JSON from ${Download_State.Selected_DataFile}`)
            }
            const data = await resp.json();
            SetDownloadedData([...data]);
        } catch (err){
            console.error(`There was an error reading the response\n${err}`);
        }
    }


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

    const RenderAreaChart = React.memo(function RenderAreaChart({DownloadedData,MinMax}){
        if (DownloadedData.length===1){
            return(<></>)
        } else {
            return (
            <ResponsiveContainer width="95%" height="90%">
                <LineChart data={DownloadedData}>
                    <XAxis dataKey="timestamp"/>
                    <YAxis domain={MinMax}/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip />
                    <Line type="monotone" dataKey="open" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" dot ={false}/>
                    <Line type="monotone" dataKey="high" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" dot={false}/>
                    <Line type="monotone" dataKey="low" stroke="#8884d8" fill="#8884d8" dot={false}/>
                </LineChart>
            </ResponsiveContainer>
            )
        };
    });

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
                    FetchRoute(Data_Router,null,"SetDownloadArgs");
                    FetchRoute(Data_Router,null,"DownloadData");
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
                    value={Download_State.SelectedCalendar}
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
                                {key:"Selected_DataFile",target:event.value},Set_DownloadState,"Dropdown"
                            );
                        }
                    }
                    value={Download_State.Selected_DataFile}
                    placeholder={Datafile_Options[0]}
                />
                <button
                className="Data_Render"
                onClick={()=>{
                    FetchJSON();
                    const vals = DownloadedData.flatMap(item=>["open","high","low"].map(key=>item[key]));
                    SetMinMax([Math.min(vals),Math.max(vals)])
                }}
                >Render Chart Data</button>
                <RenderAreaChart DownloadData={DownloadedData} MinMax={MinMax}/>
            </div>
        </div>
    )

};

export default DownloadDash;