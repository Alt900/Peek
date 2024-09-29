import React from "react";
import Dropdown from 'react-dropdown';
import { FetchRoute, StateObject_Handler, Machine_Learning_Canvas } from "./utils";

const MLDash = ({state,dispatcher})=>{

    let column = 0;
    let row = -1;

    const ML_Router = {
        
        "SetMLArgs": `https://127.0.0.1:5000/SetMLArgs?
        Epochs=${state.Epochs}
        &Batch_Size=${state.Batch_Size}
        &Learning_Rate=${state.Learning_Rate}
        &Window_Size=${state.Window_Size}
        &Targeted_Ticker=${state.Targeted_Ticker}
        &Targeted_Variable=${state.Targeted_Variable}
        &Train_Ratio=${state.Train_Ratio}
        &Test_Ratio=${state.Test_Ratio}
        &Validation_Ratio=${state.Validation_Ratio}
        &Cell_Count=${state.Cell_Count}
        &Normalization_Method=${state.ChosenNormal}
        &LSTM_Output_Size=${state.Output_Size}
        `,

        "Train_Univar": `https://127.0.0.1:5000/Train_Univar?NormMethod=${state.ChosenNormal}&ticker=${state.Targeted_Ticker}&variable=${state.Targeted_Variable}`,

    }

    return(
        <div>
            <div className="LSTM_Prediction"><Machine_Learning_Canvas data={state.LSTM_Result}/></div>
            <div className="ML_Operations">
                <button 
                    className="MLOpButtons" 
                    onClick={()=>{
                        FetchRoute(ML_Router,null,"SetMLArgs");
                        FetchRoute(ML_Router,dispatcher,"Train_Univar","LSTM_Result");
                    }}
                    style={{top:"0",left:"0"}}
                    >Train Univariate LSTM
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
                            <h6 className="ML_ParameterLabel">{key.replaceAll("_"," ")}</h6>
                            <input
                            className="ML_Input"
                            name={key}
                            value={state[key]}
                            onChange={
                                (event)=>{
                                    StateObject_Handler(
                                        {key:key,target:event.target},dispatcher,typeof state[key]=="number"?"IntOnly":"null"
                                    )}
                                }
                            >
                            </input>
                        </div>
                    )
                })}
            <Dropdown
                className="Normalization_Method"
                options={state.NormalMethods}
                onChange={
                    (NewNorm)=>{
                        StateObject_Handler({
                            key:"ChosenNormal",
                            target:NewNorm
                        },dispatcher)
                    }
                }
                value={state.ChosenNormal}
                placeholder={state.NormalMethods[0]}
            />
            </div>
        </div>
    )

}

export default MLDash;