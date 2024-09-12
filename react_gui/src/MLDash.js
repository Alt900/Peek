import React, { useReducer } from "react";
import Dropdown from 'react-dropdown';
import { Object_Reducer, FetchRoute, StateObject_Handler } from "./utils";

function MLDash(){

    let column = 0;
    let row = -1;

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

    const [ML_State,Set_MLState] = useReducer(Object_Reducer,ML_Object);

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
        </div>
    )

}

export default MLDash;