import React, { useEffect, useRef, useState } from "react";
import {
    UnivariateChart,
    CandleStick_Prediction, 
    FetchRoute, 
    Dropdown, 
    FetchJSON, 
    CheckBox, 
    HeatMap, 
    DisplayHeatMap, 
    NonInteractableCandleStickChart,
    LossGraph
} from "./utils";


const MLDash = ({state,DataDispatcher,Download_State})=>{

    const SubDash_Options = [
        "Prebuilt_OHLC",
        "Custom_Model"
    ];
    //future additions:
    //"Prebuilt_Uni",
    //"Prebuild_Multi"

    const Normalization_Options = [
        "Logarithmic",
        "Z_Score",
        "MinMax",
    ];

    const Store = [
        {id:"0",content:"LSTM Unidirectional (Tanh)"},
        //{id:"1",content:"LSTM Bidirectional (Tanh)"},
        {id:"1",content:"Dropout"},
        {id:"2",content:"Dense"},
        {id:"3",content:"Tanh"},
        {id:"4",content:"ReLU"},
        {id:"5",content:"Leaky ReLU"},
        {id:"6",content:"Sigmoid"}
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

    const [Normalization_Method,SetNormalization_Method] = useState(Normalization_Options[0]);
    const [Univariate_Ticker,SetUnivariate_Ticker] = useState(Download_State.Tickers[0]);

    const ML_Rounter = {
        "Create_Custom_Model":(Hyperparams,LayerArgs,Layers,Variables)=>`/CreateModel?Hyperparams=${Hyperparams}&Ticker=${Univariate_Ticker}&NormMethod=${Normalization_Method}&LayerArgs=${LayerArgs}&Layers=${Layers}&Variables=${Variables}`,
        "OHLC_Multivariate":(Args)=>(`/OHLC_Multivariate?NormMethod=${Normalization_Method}&Ticker=${Univariate_Ticker}&train=${Args[0]}&test=${Args[1]}&validation=${Args[2]}&batch_size=${Args[3]}&window_size=${Args[4]}&cell_count=${Args[5]}&epochs=${Args[6]}&future=${Args[7]}`)  
    };

    const [Layers,SetLayers] = useState([]);
    const [ModelPrediction,SetModelPrediction] = useState([]);
    const [Architecture,SetArchitecture] = useState([]);
    const [ArchitectureArgs,SetArchitectureArgs] = useState([]);
    const [ListState,SetListState] = useState([false,false,false,false,false]);
    const ListStateMask = ["open","high","low","close","volume"]

    const [SelectedSubDash,SetSelectedSubDash] = useState("Prebuilt_OHLC");
    const [SelectedGraphOption,SetSelectedGraphOption] = useState(null);
    const [ModelBuilt,SetModelBuilt] = useState(0);
    const [FullScreenGraph,SetFullScreenGraph] = useState(0);
    const [Data,SetData] = useState({});

    const [LevelController,SetLevelController] = useState(.8);
    const [ZoomController,SetZoomController] = useState(1.0);
    const [ScrollSensitivityController,SetScrollSensitivityController]= useState(1.5);

    const [Height,SetHeight] = useState(0);
    const [Width,SetWidth] = useState(0);
    const GridReference = useRef([]);

    const [ChosenMV,SetChosenMV] = useState(0);
    
    const GraphOptions = [
        "Loss",
        "Prediction",
        "Parameter_Heatmap",
        "Accuracy",
    ]

    const NNFI = /^(0|[1-9]\d*)(\.\d*)?$/;//Non-Negative Float including 0.| Int
    const padding = 12;

    const ConstructButtonNav = (Variables) => {
        return(
            <div>
                {Variables.Variables.map((Item,Index)=>{
                    return(
                        <button
                            key={Index}
                            onClick={()=>{SetChosenMV(Index)}}
                        >{Item}</button>
                    )
                })}
            </div>
        )
    }

    const ConstructSliders = () => {
        return(
            <>
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
            </>
        )
    }

    //case "LSTM Unidirectional (Tanh)" || "Dense":{id:0,name:"Cell_Count",content:20},
    //case "LSTM Bidirectional (Tanh)":{id:0,name:"Cell_Count",content:20},

    const ParameterDispatch = (Layer) => {
        switch(Layer){
            case "Dropout":
                return[{id:0,name:"Dropout_Rate",content:0.25}]
            case "LSTM Unidirectional (Tanh)":
                return[{id:0,name:"Cell_Count",content:20}]
            case "Dense":
                return[{id:0,name:"Cell_Count",content:20}]
            default:
                return[
                    {id:0,name:"Nothing to modify here",content:null}
                ]
        }
    }

    const DispatchDisplayCharts = (item) => {
        if(Data["Loss"]!==undefined){
            const N = Object.keys(Data["PreData"][0]).length;
            switch(item){
                case "Loss":
                    return(
                        <LossGraph data={[Data["Loss"]["Train_Loss"],Data["Loss"]["Test_Loss"]]} Height={Height} Width={Width} type="Loss"/>
                    )
                case "Prediction":
                    if(N==4){
                        return(
                            <NonInteractableCandleStickChart data={Data["PreData"]} Height={Height} Width={Width}/>
                        )
                    } else if(N==1){
                        return <UnivariateChart data={Data["Prediction"][0]} Height={Height} Width={Width}/>
                    } else {
                        return (
                        <div>
                            <UnivariateChart data={Data["Prediction"][ChosenMV]} Height={Height} Width={Width}/>
                        </div>)
                    }
                case "Parameter_Heatmap":
                    return (<DisplayHeatMap data={Data["PreData"]} Height={Height} Width={Width}/>)
                case "Accuracy":
                    return (<LossGraph data={[Data["Accuracy"]["Train_Accuracy"],Data["Accuracy"]["Test_Accuracy"]]} Height={Height} Width={Width} type="Accuracy"/>)
            }
        }
    }

    const DispatchFullScreenCharts = () => {
        console.log("Dispatching fullscreen charts ")
        if(Data["Loss"]!==undefined){
            const N = Object.keys(Data["PreData"][0]).length;
            switch(SelectedGraphOption){
                case "Loss":
                    return (<LossGraph data={[Data["Loss"]["Train_Loss"],Data["Loss"]["Test_Loss"]]} Height={Height} Width={Width} type="Loss"/>)
                case "Prediction":
                    if(N==4){
                        return (
                            <div>
                                <ConstructSliders/>
                                <CandleStick_Prediction 
                                    data={Data["Prediction"]} 
                                    Variables={ListStateMask.filter((_,Index)=>ListState[Index]==true)}
                                    Height={Height}
                                    Width={Width}
                                />
                            </div>
                    )
                    } else if(N==1){
                        return <UnivariateChart data={Data["Prediction"][0]} Height={Height} Width={Width}/>
                    } else {
                        return (
                            <div style={{overflow:"scroll"}}>
                                <ConstructButtonNav Variables={ListStateMask.filter((_,Index)=>ListState[Index]==true)}/>
                                    <UnivariateChart data={Data["Prediction"][ChosenMV]} Height={Height} Width={Width}/>
                            </div>)
                    }
                case "Parameter_Heatmap":
                    return (<HeatMap data={Data["PreData"]} Height={Height} Width={Width} labelarray={ListStateMask.filter((_,Index)=>ListState[Index]==true)}/>)
                    case "Accuracy":
                        return (<LossGraph data={[Data["Accuracy"]["Train_Accuracy"],Data["Accuracy"]["Test_Accuracy"]]} Height={Height} Width={Width} type="Accuracy"/>)
            }
        }
    }

    const GraphOptionsComponent = () => {
        const FullScreenReference = useRef(0);
        useEffect(()=>{
            if(GridReference.current.length>0 && FullScreenReference.current==0){
                let _ = GridReference.current.map((ref)=>{
                    if(ref){
                        const computed = getComputedStyle(ref);
                        SetWidth(parseFloat(computed.width));
                        SetHeight(parseFloat(computed.height));
                    };
                });
            } else {
                const computed = getComputedStyle(FullScreenReference.current);
                SetWidth(parseFloat(computed.width));
                SetHeight(parseFloat(computed.height));
            }
        },[])
        let XPosition = 0;
        let YPosition = 0;
        return(
            ModelBuilt==1 && FullScreenGraph==0 ? (
                <div>
                    <ul className="GridList" style={{overflowX:"scroll"}}>
                        {GraphOptions.map((Item,Index)=>{
                            if(Index%2===0 && Index!==0){
                                XPosition += 50;
                                YPosition = 0;
                            } else if (Index%2!==0 && Index!==0 || Index===1){
                                YPosition = 50;
                            }
                            return(
                                <li
                                    key={Index}
                                    ref={(prev)=>(GridReference.current[Index]=prev)}
                                    className="GridGraphs"
                                    style={Index!==0?{
                                        left:`${XPosition}%`,
                                        top:`${YPosition}%`
                                    }:{left:"0",top:"0"}}
                                >{Item.replaceAll("_"," ")}
                                    {DispatchDisplayCharts(Item)}
                                    <button
                                        className="TransparentGraphButton"
                                        onClick={()=>{
                                            SetSelectedGraphOption(Item);
                                            SetFullScreenGraph(1);
                                        }}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                    <button
                        style={{
                            position:"absolute",
                            top:"5%",
                            left:"0",
                            width:"10%",
                            height:"5%",
                            color: "var(--primary_color)",
                            backgroundColor: "var(--secondary_color)"
                        }}
                        onClick={()=>{
                            SetModelBuilt(0);
                            SetSelectedSubDash("Custom_Model");
                        }}
                    >Back to architecture</button>
                </div>
            ) : (
                <div
                    className="FullScreenContainer"
                    ref={FullScreenReference}
                >
                    {DispatchFullScreenCharts()}
                    <button
                        style={{
                            position:"absolute",
                            top:"5%",
                            left:"0",
                            width:"10%",
                            height:"5%",
                            color: "var(--primary_color)",
                            backgroundColor: "var(--secondary_color)"
                        }}
                        onClick={()=>{SetFullScreenGraph(0)}}
                    >Back to graph options</button>
                </div>
            )
        );
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
        SetLayers([...Layers,Index]);
    } 

    const HandleArchitectureRemove = (Index) => {
        document.documentElement.style.setProperty('--y-offset',`${Index*padding}%`);
        SetArchitecture(Architecture.filter((_,i)=>i!==Index));
        SetArchitectureArgs(prev=>prev.filter((_,i)=>i!==Index));
        SetLayers(prev=>prev.filter((_,i)=>i!==Index));
    }

    useEffect(()=>{
        //architeture validation
        //Dropout cannot be first
        //Last layer has to be dense 
        if(Architecture.length===1?Architecture[0].id==="1":false){
            HandleArchitectureRemove(0);
        }
        //dense has to be the last layer, that will be checked on button click
        //architecture[length-1].id==="3"?handleadd(3):continue to route
    },[Architecture])

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
                    onClick={async()=>{
                        const data = await FetchRoute(null,ML_Rounter["Create_Custom_Model"](JSON.stringify(Preprocessing),JSON.stringify(ArchitectureArgs),Layers,ListState));
                        SetData(data);
                        SetModelBuilt(1);
                        SetSelectedSubDash("Prebuilt_Graphs");
                    }}
                >Build Model</button>
            </div>
        )
    }

    const MLSubDash = (Selected) => {
        if(Selected==="Prebuilt_Uni"){
            return(
                <>
                    <div className="Chart_Container">
                        <UnivariateChart data = {Download_State.Cached_JSON.map(d=>d.high)}/>
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
        } else if(Selected==="Prebuilt_OHLC"){
            return(
                <div>
                    <div className="OHLC_Chart_Container">
                        <CandleStick_Prediction data={ModelPrediction} Variables={["open","high","low","close"]}/>
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
        } else if(Selected==="Custom_Model" && ModelBuilt===0){
            return(
                <>
                    <Buildable_Architecture/>
                    <div className="VarsContainer">
                        <CheckBox Options={["open","high","low","close","volume"]} ListState={ListState} Dispatcher={SetListState}/>
                    </div>
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
        } else if(SelectedSubDash==="Prebuilt_Graphs" && ModelBuilt===1){
            return(
                <div className="Graphs_Display">
                    <GraphOptionsComponent/>
                </div>
            )
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