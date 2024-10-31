import React, { useState } from "react";
import { StateObject_Handler, FetchRoute, Dropdown } from "./utils";

function StatisticsDash({state,dispatcher,ArimaParams,SetArimaParams,ThetaParams,SetThetaParams,OLSParams,SetOLSParams,Metrics_Checked,SetMetrics_Checked,ClassicParams,SetClassicParams,Statistics_State,Set_StatisticsState,MetricsCache,SetMetricsCache}){
    let column = 1;
    let row = 0;

    const Operations = ["Linear Regression"];

    const [FormOpen,SetFormOpen] = useState(false);

    const [FormKey,SetFormKey] = useState(null);

    const [Selected_Operations,SetSelected_Operations] = useState(Operations[0])

    const [LR_ChartData, Set_LR_ChartData] = useState([{ name: 'No data loaded'}]);

    const [LR_Summary,Set_LR_Summary] = useState("No Linear Regression Model has been ran yet.")

    const Statistics_Router = {
        "Run_ARIMA": `/Run_ARIMA?order=${ArimaParams.order}&seasonal_order=${ArimaParams.seasonal_order}&trend=${ArimaParams.trend}&enforce_stationarity=${ArimaParams.enforce_stationarity}&enforce_invertibility=${ArimaParams.enforce_invertibility}&concentrate_scale=${ArimaParams.concentrate_scale}&trend_offset=${ArimaParams.trend_offset}&validate_specification=${ArimaParams.validate_specification}&missing=${ArimaParams.missing}&frequency=${ArimaParams.frequency}&ticker=${ArimaParams.ticker}&dependent=${ArimaParams.dependent}&independent=${ArimaParams.independent}`,
        "Run_Theta":`/Run_Theta?period=${ThetaParams.period}&deseasonalize=${ThetaParams.deseasonalize}&use_test=${ThetaParams.use_test}&method=${ThetaParams.method}&difference=${ThetaParams.difference}&ticker=${ThetaParams.ticker}&dependent=${ThetaParams.dependent}&independent=${ThetaParams.independent}&toforecast=${ThetaParams.ForecastInterval}`,
        "Run_OLS":`/Run_OLS?missing=${OLSParams.missing}&hasconst=${OLSParams.hasconst}&ticker=${OLSParams.ticker}&dependent=${OLSParams.dependent}&independent=${OLSParams.independent}`,
        "Run_Classic":`/Run_ClassicLR?ticker=${ClassicParams.ticker}&dependent=${ClassicParams.dependent}&independent=${ClassicParams.independent}`,
        //"GetMetric": (Method)=>{`/FetchMetric?${Method}&ticker=`}
    }

    //dragging handlers
    const [offset,setoffset] = useState({x:0,y:0})
    const [isdragging,setisdragging] = useState(false);
    const [position,setposition] = useState({x:0,y:0})

    const HandleMouseDown = (event) => {
        setisdragging(true);
        setoffset({x:event.clientX-position.x,y:event.clientY-position.y,});
    };

    const HandleMouseMove = (event) => {
        if(isdragging){
            setposition({x:event.clientX-offset.x,y:event.clientY-offset.y});
        }
    };

    const HandleMouseUp = () => {
        setisdragging(false);
    }

    const AddMetricToObject = (key,value) => {
        SetMetricsCache(previous => ({
            ...previous,
            [key]:value
        }))
    }

    const PopMetricFromObject = (key) => {
        SetMetricsCache(previous => {
            const copy = {...previous};
            delete copy[key];
            return copy;
        });
    }

    const DispatchLRForm = () => {
        switch(FormKey){
            case "Autoregressive_Integrated_Moving_Average":
                if(FormOpen){
                    return(
                        <div>
                            <div className="Form" onMouseDown={HandleMouseDown} onMouseMove={HandleMouseMove} onMouseUp={HandleMouseUp} style={{left:`${position.x}px`,top:`${position.y}px`,cursor: isdragging ? 'grabbing' : 'grab',}}>
                                <button className="CloseForm" onClick={()=>{SetFormOpen(false)}}>X</button>
                                <h2 style={{fontSize:"15px"}}>
                                    Autoregressive Integrated Moving Average Parameters
                                </h2>
                                {
                                    Object.keys(ArimaParams).map((key,_)=>{
                                        return(
                                            <>
                                            <label>{key.replaceAll("_"," ")}</label>
                                            <br/>
                                            <input
                                                className="FormInput"
                                                name={key}
                                                value={ArimaParams[key]}
                                                placeholder={ArimaParams[key]}
                                                onChange={(event)=>StateObject_Handler({key:key,target:event.target},SetArimaParams)}
                                            ></input>
                                            <br/>
                                            <br/>
                                            </>
                                        );
                                    })
                                }
                                <br/>
                                <button
                                    className="FormButton"
                                    onClick={()=>{FetchRoute(Set_StatisticsState,Statistics_Router["Run_ARIMA"],"LR_Results")}}
                                >Run ARIMA</button>
                            </div>
                        </div>
                    );
                }
            case "Theta":
                if(FormOpen){
                    return(
                        <div>
                            <div className="Form" onMouseDown={HandleMouseDown} onMouseMove={HandleMouseMove} onMouseUp={HandleMouseUp} style={{left:`${position.x}px`,top:`${position.y}px`,cursor: isdragging ? 'grabbing' : 'grab',}}>
                                <button className="CloseForm" onClick={()=>{SetFormOpen(false)}}>X</button>
                                <h2 style={{fontSize:"15px"}}>
                                    Theta Model Parameters
                                </h2>
                                {
                                    Object.keys(ThetaParams).map((key,_)=>{
                                        return(
                                            <>
                                            <label>{key.replaceAll("_"," ")}</label>
                                            <br/>
                                            <input
                                                className="FormInput"
                                                name={key}
                                                value={ThetaParams[key]}
                                                placeholder={ThetaParams[key]}
                                                onChange={(event)=>StateObject_Handler({key:key,target:event.target},SetThetaParams)}
                                            ></input>
                                            <br/>
                                            <br/>
                                            </>
                                        );
                                    })
                                }
                                <br/>
                                <button
                                    className="FormButton"
                                    onClick={()=>{FetchRoute(Set_StatisticsState,Statistics_Router["Run_Theta"],"LR_Results")}}
                                >Run Theta</button>
                            </div>
                        </div>
                    );
                }
            case "Ordinary_least_squares":
                if(FormOpen){
                    return(
                        <div>
                            <div className="Form" onMouseDown={HandleMouseDown} onMouseMove={HandleMouseMove} onMouseUp={HandleMouseUp} style={{left:`${position.x}px`,top:`${position.y}px`,cursor: isdragging ? 'grabbing' : 'grab',}}>
                                <button className="CloseForm" onClick={()=>{SetFormOpen(false)}}>X</button>
                                <h2 style={{fontSize:"15px"}}>
                                    Ordinary Least Squares Model Parameters
                                </h2>
                                {
                                    Object.keys(OLSParams).map((key,_)=>{
                                        return(
                                            <>
                                            <label>{key.replaceAll("_"," ")}</label>
                                            <br/>
                                            <input
                                                className="FormInput"
                                                name={key}
                                                value={OLSParams[key]}
                                                placeholder={OLSParams[key]}
                                                onChange={(event)=>StateObject_Handler({key:key,target:event.target},SetOLSParams)}
                                            ></input>
                                            <br/>
                                            <br/>
                                            </>
                                        );
                                    })
                                }
                                <br/>
                                <button
                                    className="FormButton"
                                    onClick={()=>{FetchRoute(Set_StatisticsState,Statistics_Router["Run_OLS"],"LR_Results")}}
                                >Run OLS</button>
                            </div>
                        </div>
                    );
                }
            default:
                if(FormOpen){
                    return(
                        <div>
                            <div className="Form" onMouseDown={HandleMouseDown} onMouseMove={HandleMouseMove} onMouseUp={HandleMouseUp} style={{left:`${position.x}px`,top:`${position.y}px`,cursor: isdragging ? 'grabbing' : 'grab',}}>
                                <button className="CloseForm" onClick={()=>{SetFormOpen(false)}}>X</button>
                                <h2 style={{fontSize:"15px"}}>
                                    Classic Linear Regression Model Parameters
                                </h2>
                                {
                                    Object.keys(ClassicParams).map((key,_)=>{
                                        return(
                                            <>
                                            <label>{key.replaceAll("_"," ")}</label>
                                            <br/>
                                            <input
                                                className="FormInput"
                                                name={key}
                                                value={ClassicParams[key]}
                                                placeholder={ClassicParams[key]}
                                                onChange={(event)=>StateObject_Handler({key:key,target:event.target},SetClassicParams)}
                                            ></input>
                                            <br/>
                                            <br/>
                                            </>
                                        );
                                    })
                                }
                                <br/>
                                <button
                                    className="FormButton"
                                    onClick={()=>{FetchRoute(Set_StatisticsState,Statistics_Router["Run_Classic"],"LR_Results")}}
                                >Run Classic LR</button>
                            </div>
                        </div>
                    );
                }
        }
    }

    const RenderOperations = () => {
        switch(Selected_Operations){
            case "Metrics":
                return(
                    Object.keys(Metrics_Checked).map((key,index)=>{
                        row += 1
                        return(
                            <div className="Metrics_Container" style={{top:`${row*8}%`}}>
                                <label className = "Metrics_Label">{key}</label>
                                <input
                                    className="Metric_checkboxes"
                                    type="checkbox"
                                    checked={Metrics_Checked[key]}
                                    name={key}
                                    onChange={()=>{
                                        StateObject_Handler(
                                            {key:key,target:!Metrics_Checked[key]},
                                            SetMetrics_Checked,
                                            null
                                        );
                                        if(Metrics_Checked[key]===true){
                                            AddMetricToObject(key,FetchRoute(
                                                Statistics_Router['some route']//uhhhh huh?
                                            ));
                                        } else {
                                            PopMetricFromObject(key);
                                        }
                                    }}
                                ></input>
                            </div>
                        )
                    })
                )

            default:
                return(
                    [
                        "Classic_linear_regression",
                        "Ordinary_least_squares",
                        "Autoregressive_Integrated_Moving_Average",
                        "Theta"
                    ].map((key,index)=>{
                        if(index%1===0 && index!==0){
                            column+=1
                        }
                        return(
                            <button
                                className="SLR_Button"
                                style={{left:`${row*20}%`,top:`${column*8}%`,z_index:"1"}}
                                name={key}
                                onClick={()=>{SetFormKey(key);DispatchLRForm();SetFormOpen(true)}}
                            >{key.replaceAll("_"," ")}</button>
                        )
                    })
                )
        }
    }

    return(
        <div>
            {DispatchLRForm()}
            {console.log(document.getElementById("LRForm"))}
            <div className="Stats_Operations">
                <div style={{position:"absolute",left:"0",width:"50%",height:"5%"}}>
                    <Dropdown
                        Options={Operations}
                        State={Selected_Operations}
                        Dispatcher={SetSelected_Operations}
                    />
                </div>
                {RenderOperations()}
            </div>
            <textarea
            className="Stats_Report"
            value={Statistics_State.LR_Results.replace(/\\n/g, '\n')}
            readOnly
            />
        </div>
    )
};

export default StatisticsDash;