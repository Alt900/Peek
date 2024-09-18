import React, { useReducer } from "react";
import Dropdown from 'react-dropdown';
import { Object_Reducer, StateObject_Handler } from "./utils";

function StatisticsDash(){
    let row = -1;

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
        P_Val: 0.5,
        Operations: ["Metrics", "Linear Regression"],
        Selected_Operations: "Metrics",
    }

    const [Statistics_State,Set_StatisticsState] = useReducer(Object_Reducer,Statistics_Object);

    const Statistics_Router = {
        "Set_Exo_Endo": `https://127.0.0.1:5000/Set_Exo_Endo?
        Endo=${Statistics_State.Endo}
        &Exo=${Statistics_State.Exo}
        `,
        "Set_ARIMA_Params": `https://127.0.0.1:5000/Set_ARIMA_Params?
        Order=[${Statistics_State.Order}]
        &Seasonal_Order=[${Statistics_State.Seasonal_Order}]
        `,
        "Call_LR": `https://127.0.0.1:5000/Fit_Model?Model=${Statistics_State.Selected_LR}`,
    }

    const MetricsDash = () => (
        <div className="MetricsDash">
        </div>
    )

    const LRDash = () => (//LR dash contains another sub-dash for LR models and each models corresponding parameters
        <div className="LRDash">
            {()=>{
                let i = -1;
                switch(Statistics_State.Selected_LR){
                    case "Theta":

                    case "OLS":

                    case "ARIMA":

                    default:
                        <>
                            <div className="LR_Parameters" style={{left:"0",top:`${10*i}`}}>
                                {Statistics_State.Classic_Parameters.map((key,index)=>{
                                    i++
                                    return(
                                        <div className="LR_Parameter_Container">
                                            <h5 className="LR_Parameter_Label">{key.replaceAll("_"," ")}</h5>
                                            <input
                                                className="ML_Input"
                                                name={key}
                                                value={Statistics_State["Classic_LR"][key]}
                                                onChange={
                                                    (event)=>{
                                                        StateObject_Handler(
                                                            {key:key,target:event.target},Set_StatisticsState,typeof Statistics_State["Classic_LR"][key]=="number"?"IntOnly":"null"
                                                        )}
                                                    }
                                            >
                                            </input>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="LR_Operations">
                                
                            </div>
                        </>
                }
            }}
        </div>
    )

    function RenderSubDash(){
        switch(Statistics_State.Selected_Operations) {
            case "Linear Regression":
                return(<LRDash/>)
            default:
                return(<MetricsDash/>)
        }
    }

    return(
        <div>
            <div className="Stats_Operations">
                <Dropdown
                    className="Operation_Selection"
                    options={Statistics_State.Operations}
                    onChange={
                        (event)=>{
                            StateObject_Handler({key:"Selected_Operations",target:event.value},Set_StatisticsState,"Dropdown")
                        }
                    }
                    value={Statistics_State.Selected_Operations}
                    placeholder={Statistics_State.Operations[0]}
                />
            </div>
            <div className="StatsOpOutput">

            </div>
            <div className="StatsOpDisplay">
                    {RenderSubDash()}
            </div>
        </div>
    )
};

export default StatisticsDash;