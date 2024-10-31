import React, { useEffect, useState } from "react";
import {Univariate_Chart, Candlestick_Prediction, FetchRoute, Dropdown, FetchJSON } from "./utils";


const MLDash = ({state,DataDispatcher,Download_State})=>{

    const SubDash_Options = [
        "Prebuilt_OHLC",
    ];
    //future additions:
    //Custom_Model
    //"Prebuilt_Uni",
    //"Prebuild_Multi"

    const Normalization_Options = [
        "Logarithmic",
        "Z_Score",
        "MinMax",
    ];

    const Store = [
        {id:"0",content:"LSTM Unidirectional"},
        {id:"1",content:"LSTM Bidirectional"},
        {id:"2",content:"Dropout"},
        {id:"3",content:"Dense"},
    ];

    const [Preprocessing,SetPreprocessing] = useState([
        {id:"Train_Ratio",value:0.7},
        {id:"Test_Ratio",value:0.2},
        {id:"Validation_Ratio",value:0.1},
        {id:"Batch_Size",value:32},
        {id:"Window_Size",value:5},
        {id:"Cell_Count",value:32},
        {id:"Epochs",value:10},
        {id:"Future_Prediction_Step",value:5}
    ]);

    //since the previous object state's id was used to map everything, to prevent re-rendering on value change
    //a separate immutable array is kept to prevent a re-render
    const PreprocessingMap = ["Test_Ratio","Train_Ratio","Validation_Ratio","Batch_Size","Window_Size","Cell_Count","Epochs"]

    const [Normalization_Method,SetNormalization_Method] = useState(Normalization_Options[0]);
    const [Univariate_Ticker,SetUnivariate_Ticker] = useState(Download_State.Tickers[0]);

    const ML_Rounter = {
        "Create_Custom_Model":(Args,Layers)=>`/CreateModel?Args=${Args}&Layers=${Layers}`,
        "OHLC_Multivariate":(Args)=>(`/OHLC_Multivariate?NormMethod=${Normalization_Method}&Ticker=${Univariate_Ticker}&train=${Args[0]}&test=${Args[1]}&validation=${Args[2]}&batch_size=${Args[3]}&window_size=${Args[4]}&cell_count=${Args[5]}&epochs=${Args[6]}&future=${Args[7]}`)  
    };

    const [ModelPrediction,SetModelPrediction] = useState([]);
    const NNFI = /^(0|[1-9]\d*)(\.\d*)?$/;//Non-Negative Float including 0.| Int
    const padding = 12;

    const [SelectedSubDash,SetSelectedSubDash] = useState("Prebuilt_OHLC");

    const [Architecture,SetArchitecture] = useState([]);
    const [ArchitectureArgs,SetArchitectureArgs] = useState([]);

    const ParameterDispatch = (Layer) => {
        switch(Layer){
            case "LSTM Unidirectional":
                return[
                    {id:0,name:"Cell_Count",content:20},
                    {id:1,name:"Activation_Function",content:"Tanh"},
                ]
            case "LSTM Bidirectional":
                return[
                    {id:0,name:"Cell_Count",content:20},
                    {id:1,name:"Activation_Function",content:"Tanh"},
                ]
            case "Dropout":
                return[{id:0,name:"Dropout_Rate",content:0.25}]
            default:
                return[
                    {id:0,name:"Output_Size",content:1},
                    {id:1,name:"Activation_Function",content:"ReLU"},
                    {id:2,name:"Cell_Count",content:20}
                ]
        }
    }

    const HandleLayerParameters = (ParameterSetIndex,ParameterID,NewFields)=>{
        SetArchitectureArgs(prev=>{
            const DeepCopy = prev.map((Layer,Index)=>{
                if(Index===ParameterSetIndex){
                    return Layer.map(Parameters=>Parameters.id===ParameterID?{...Parameters,...NewFields}:Parameters)
                }
                return Layer;
            });
            return [...DeepCopy];
        })
    };

    const HandlePreProcessingUpdate = (ID,Value) => {
        SetPreprocessing(PreviousState=>
            PreviousState.map(Item=>{
                if(Item.id===ID){
                    if(Item.typeofinput==="Float" || Item.typeofinput==="Int"){
                        if (NNFI.test(Value)){
                            return({...Item,value:Value})
                        }else{return Item}
                    } else {return{...Item,value:Value}}
                }
                return Item;
            })
        )
    }

    const HandleArchitectureAdd = (Index) =>  {
        document.documentElement.style.setProperty('--y-offset',`${Architecture.length*padding}%`);
        SetArchitecture([...Architecture,Store[Index]]);
        SetArchitectureArgs(prev=>[...prev,ParameterDispatch(Store[Index].content)])
    } 

    const HandleArchitectureRemove = (Index) => {
        document.documentElement.style.setProperty('--y-offset',`${Index*padding}%`);
        SetArchitecture(Architecture.filter((_,i)=>i!==Index));
        SetArchitectureArgs(prev=>prev.filter((_,i)=>i!==Index));
    }


    const Buildable_Architecture = () => {
        const Architecture_Store_Component = () => (
            <div className="Architecture_Store">
                {Store.map((Item)=>{
                    return(
                        <button 
                        className="Store_Buttons"
                        onClick={()=>{HandleArchitectureAdd(Item.id)}}
                        style={{left:`${Item.id*padding}%`}}
                        >{Item.content}
                        </button>
                    );
                })}
            </div>
        )
        
        const Architecture_Builder_Component = () => {
            return(
                <div className="Architecture_Build">
                    {Architecture.map((Item,Index)=>(
                        <>
                            <h3 
                                className="Arch_Layer_Tonext"
                                style={{left:`${(Index-1)*18}%`,}}
                            >{`${Index!==0?"------>":""}`}</h3>
                            <div className="ParameterCard"
                                style={{left:`${Index*18}%`}}
                            >
                                <button 
                                    className="CloseParamCard"
                                    onClick={()=>HandleArchitectureRemove(Index)}
                                >X</button>
                                <h3 className="ParamCardTitle">{Item.content}</h3>
                                <h3>---------------</h3>
                                {
                                    ParameterDispatch(Item.content).map((Parameter,SubIndex)=>{
                                        return(
                                            <div className="ParamterContainer" style={{top:`${(SubIndex+1)*50}%`}}>
                                                <h3 className="Parameter_Label" >{Parameter.name.replaceAll("_"," ")+":"}</h3>
                                                <input
                                                    className="Parameter_Input"
                                                    value={ArchitectureArgs[Index][SubIndex].content}
                                                    onChange={(e)=>HandleLayerParameters(Index,Parameter.id,{content:e.target.value})}
                                                >
                                                </input>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </>
                    ))}
                </div>
            )
        }
        return (
            <div className="Architecture_Dash">
                <Architecture_Store_Component/>
                <Architecture_Builder_Component ArchitectureArgs={ArchitectureArgs}/>
                <h1 className="Arch_Sep">-----------------------------------</h1>
                <button
                    className="BuildCustomArch"
                    onClick={()=>FetchRoute(null,ML_Rounter["CreateModel"](Architecture,ArchitectureArgs))}
                >Build Model</button>
            </div>
        )
    }

    const MLSubDash = (Selected) => {
        if(Selected==="Prebuilt_Uni"){
            return(
                <>
                    <div className="Chart_Container">
                        <Univariate_Chart data = {Download_State.Cached_JSON} variable='high'/>
                    </div>
                </>
            );
        } else if(Selected==="Prebuild_Multi"){
            return(
                <div className="Controll_Container">
                    <button
                        className="Multivariate_Run"
                        onClick={
                            async () => {
                                const Prediction = await FetchRoute(null,ML_Rounter["Multivariate_Prebuilt"],null);
                                SetModelPrediction(Prediction.value);
                            }
                        }
                    >Run Multivariate LSTM</button>
                </div>
            );
        } else if(Selected==="Prebuilt_OHLC"){//cached data was removed and causes data is undefined in candlestick prediction component
            return(//render OHLC
                <div>
                    <div className="OHLC_Chart_Container">
                        <Candlestick_Prediction data={Download_State.Cached_JSON} prediction={ModelPrediction}/>
                    </div>
                    <div className="OHLC_Controls">
                        <button
                            className="OHLC_MV_Train"
                            onClick={async ()=>{
                                let Prediction = await FetchRoute(null,ML_Rounter["OHLC_Multivariate"](Preprocessing.map(d=>d.value)),null);
                                FetchJSON(Univariate_Ticker,DataDispatcher)
                                SetModelPrediction(Prediction);
                            }}
                        >Run OHLC Multivariate LSTM</button>
                        <div style={{position:"absolute",right:"0",top:"0",width:"50%",height:"10%",zIndex:"2"}}>
                            <Dropdown
                                Options={Normalization_Options}
                                State={Normalization_Method}
                                Dispatcher={SetNormalization_Method}
                            />
                        </div>
                        <div style={{position:"absolute",right:"0",top:"10%",width:"50%",height:"10%",zIndex:"1"}}>
                            <Dropdown
                                Options={Download_State.Tickers}
                                State={Univariate_Ticker}
                                Dispatcher={SetUnivariate_Ticker}
                            />
                        </div>
                        {Preprocessing.map((Item,Index)=>{
                            return(
                                <>
                                    <h3 
                                        className="Preprocessing_Label"
                                        style={{top:`${(Index+2)*16}%`}}
                                    >{Item.id.replaceAll("_"," ")}</h3>
                                    <input
                                        className="Preprocessing_Input"
                                        value={Item.value}
                                        onChange={(e)=>HandlePreProcessingUpdate(Item.id,e.target.value)}
                                        style={{top:`${(Index+2)*16}%`}}
                                    />
                                </>
                            )
                        })}
                    </div>
                </div>
            );
        } else if(Selected==="Custom_Model"){
            return(//render custom architecture builder
                <>
                    <Buildable_Architecture/>
                    <div className="PreprocessingContainer">
                        <div style={{position:"absolute",right:"0",top:"0",width:"50%",height:"10%",zIndex:"2"}}>
                            <Dropdown
                                Options={Normalization_Options}
                                State={Normalization_Method}
                                Dispatcher={SetNormalization_Method}
                            />
                        </div>
                        <div style={{position:"absolute",right:"0",top:"10%",width:"50%",height:"10%",zIndex:"1"}}>
                            <Dropdown
                                Options={Download_State.Tickers}
                                State={Univariate_Ticker}
                                Dispatcher={SetUnivariate_Ticker}
                            />
                        </div>
                        {Preprocessing.map((Item,Index)=>{
                            return(
                                <>
                                    <h3 
                                        className="Preprocessing_Label"
                                        style={{top:`${(Index+2)*16}%`}}
                                    >{Item.id}</h3>
                                    <input
                                        className="Preprocessing_Input"
                                        value={Item.value}
                                        onChange={(e)=>HandlePreProcessingUpdate(Item.id,e.target.value)}
                                        style={{top:`${(Index+2)*16}%`}}
                                    />
                                </>
                            )
                        })}
                    </div>
                </>
            );
        } else{return(<></>)};
    }

    return(
        <div>
            <div className="MLSubDashOptions">
                <Dropdown
                    Options={SubDash_Options}
                    State={SelectedSubDash}
                    Dispatcher={SetSelectedSubDash}
                />
            </div>
            {MLSubDash(SelectedSubDash)}
        </div>
    )
}

export default MLDash;