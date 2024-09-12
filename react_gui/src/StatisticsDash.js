import React, { useReducer } from "react";
import Dropdown from 'react-dropdown';
import { Object_Reducer, FetchRoute, StateObject_Handler } from "./utils";

function StatisticsDash(){

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
        Seasonal_Order: [0,0,0,0],
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
        "LR_Fit": `https://127.0.0.1:5000/Fit_Model?Model=${Statistics_State.Selected_LR}`,
        "LR_Predict": `https://127.0.0.1:5000/Model_Predict?Model=${Statistics_State.Selected_LR}`//will predict with exo
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

            </div>
        </div>
    )
};

export default StatisticsDash;