import React, { useState, useReducer } from "react";

import StatisticsDash from "./StatisticsDash";
import MLDash from "./MLDash";
import DownloadDash from "./DownloadDash";
import QuantumDash from "./QuantumDash";

import { Object_Reducer } from "./utils";
let Today = new Date();
let Current_Year = Today.getFullYear();
let Current_Month = Today.getMonth();

function Dashboard(){

    const [Primary_Color, Set_Primary_Color] = useState("rgba(255,51,255,1)");
    const [Secondary_color, Set_Secondary_Color] = useState("rgba(0,0,0,1)");

    const [DashboardSelected,SetDashboardSelected] = useState("ML");

    const DashboardNavigation = (NewDashboard) => {
        SetDashboardSelected(NewDashboard);
        RenderDashboard();
    };

    const ChangeCSS = () => {
        document.documentElement.style.setProperty('--primary_color',Primary_Color);
        document.documentElement.style.setProperty('--secondary_color',Secondary_color);
    }


    //global dashboard state management 

    /// quantum computing ///

    const Quantum_Object = {
        OPENQASM_Script: "OPENQASM 2.0;\ninclude 'qelib1.inc';\nqreg q[4];\ncreg c[4];",
        QASM_Result: "",
        QAE_Type: "Canonical",
        QAE_Qubits: 2,
        QAE_Probability: 0.2,
        QAE_Args: [],
        qubits: 4,
    }

    const QAE_Args = {
        probability: 0.01,
        qubits: 4,
        qae_type: "Canonical",
    };

    const FIP_Args = {
        low_bounds: [0,1],
        high_bounds: [5,6],
        cashflow: [1.2,1.5],
        epsilon: 0.01,
        alpha: 0.05,
    }

    const Grovers_Args = {
        qubits: 2
    }

    const [Quantum_State,Set_QuantumState] = useReducer(Object_Reducer,Quantum_Object);

    const [QAE_Params, SetQAE_Params] = useReducer(Object_Reducer,QAE_Args)
    const [FIP_Params, SetFIP_Params] = useReducer(Object_Reducer,FIP_Args)
    const [Grovers_Params, SetGrovers_Params] = useReducer(Object_Reducer,Grovers_Args);

    /// statistics ///

    const arima_args={
        order:"[0,0,0]",
        seasonal_order:"[0,0,0,0]",
        trend: "c",
        enforce_stationarity: false,
        enforce_invertibility: false,
        concentrate_scale:false,
        trend_offset: 1,
        validate_specification: true,
        missing: "None",
        frequency: "None",
        ticker: "LMT",
        dependent: "open",
        independent: "volume"
    }

    const theta_args={
        period:"5",
        deseasonalize:"True",
        use_test:"True",
        method:"auto",
        difference:"False",
        ticker: "LMT",
        dependent: "open",
        independent: "volume",
        ForecastInterval: "5"
    }

    const ols_args={
        missing:"none",
        hasconst:"none",
        ticker: "LMT",
        dependent: "open",
        independent: "volume"
    }

    const metrics_checked={
        Mean:0,
        Mode:0,
        Median:0,
        Standard_Deviation:0,
        Z_score:0,
        P_score:0,
        Null_hypothesis:0,
        ticker: "LMT",
        variable: "open"
    }

    const classic_args = {
        ticker: "LMT",
        dependent: "open",
        independent: "volume"
    }

    const [ArimaParams,SetArimaParams]=useReducer(Object_Reducer,arima_args);

    const [ThetaParams,SetThetaParams]=useReducer(Object_Reducer,theta_args);

    const [OLSParams,SetOLSParams]=useReducer(Object_Reducer,ols_args);

    const [Metrics_Checked, SetMetrics_Checked] = useReducer(Object_Reducer,metrics_checked);

    const [ClassicParams,SetClassicParams] = useReducer(Object_Reducer,classic_args)

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
        P_Val: 0.5,
        LR_Results: "No statistical operations have been performed yet.",
    }

    const [MetricsCache,SetMetricsCache] = useState({});

    const [Statistics_State,Set_StatisticsState] = useReducer(Object_Reducer,Statistics_Object);

    /// machine learning ///

    const ML_Object = {
        Epochs: 10,
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
        ChosenNormal:"",
        Output_Size:20,
        LSTM_Result:"No LSTM has been ran yet."
    }

    const [ML_State,Set_MLState] = useReducer(Object_Reducer,ML_Object);

    /// download ///
    
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
        Cached_JSON: [{ name: 'No data loaded'}],
        StartYear: Current_Year,
        StartMonth: Current_Month,
        StartDay: 1,
        EndYear: Current_Year,
        EndMonth: Current_Month,
        EndDay: 1
    }

    const [Download_State,Set_DownloadState] = useReducer(Object_Reducer,Download_Object);

    function RenderDashboard(){
        switch(DashboardSelected) {
            case "ML":
                return(<MLDash state={ML_State} DataDispatcher={Set_DownloadState} Download_State={Download_State}/>)
            case "Statistics":
                return(<StatisticsDash
                    state={Statistics_State}
                    dispatcher={Set_StatisticsState}
                    ArimaParams={ArimaParams}
                    SetArimaParams={SetArimaParams}
                    ThetaParams={ThetaParams}
                    SetThetaParams={SetThetaParams}
                    OLSParams={OLSParams}
                    SetOLSParams={SetOLSParams}
                    Metrics_Checked={Metrics_Checked}
                    SetMetrics_Checked={SetMetrics_Checked}
                    ClassicParams={ClassicParams}
                    SetClassicParams={SetClassicParams}
                    Statistics_State={Statistics_State}
                    Set_StatisticsState={Set_StatisticsState}
                    MetricsCache={MetricsCache}
                    SetMetricsCache={SetMetricsCache}
                    />)
            case "Quantum":
                return (<QuantumDash
                    state={Quantum_State}
                    dispatcher={Set_QuantumState}
                    QAE_Params={QAE_Params}
                    SetQAE_Params={SetQAE_Params}
                    FIP_Params={FIP_Params}
                    SetFIP_Params={SetFIP_Params}
                    Grovers_Params={Grovers_Params}
                    SetGrovers_Params={SetGrovers_Params}
                    />)
            default:
                return(<DownloadDash state={Download_State} dispatcher={Set_DownloadState}/>)
        }
    }
    
    return (
        <div className="Dashboard_Container">

            <div className="Color_Control">
                <input
                    type="text"
                    value={Primary_Color}
                    className="Primary_Color"
                    placeholder={Primary_Color}
                    onChange={(event)=>{Set_Primary_Color(event.target.value)}}
                />
                <input
                    type="text"
                    value={Secondary_color}
                    className="Secondary_color"
                    placeholder={Secondary_color}
                    onChange={(event)=>{Set_Secondary_Color(event.target.value)}}
                />
                <button
                onClick={ChangeCSS}
                className="ChangeColors"
                >Change Colors</button>
                <br/>
                <a className="RGBARefLink" href="https://www.rapidtables.com/web/color/RGB_Color.html">RGBA color reference</a>
            </div>

            <div className="Dashboard_Shadow"></div>
            <div className="TabsContainer">
                <button 
                className="Tabs"
                onClick={()=>{DashboardNavigation("ML")}}
                style={{
                    left:"0"
                }}
                >Machine Learning</button>
                <button 
                className="Tabs"
                onClick={()=>{DashboardNavigation("Statistics")}}
                style={{
                    left:"10%",
                }}
                >Statistics</button>
                <button 
                className="Tabs"
                onClick={()=>{DashboardNavigation("Download")}}
                style={{
                    left:"20%"
                }}
                >Data</button>
                <button 
                className="Tabs"
                onClick={()=>{
                    DashboardNavigation("Quantum")

                }}
                style={{
                    left:"30%"
                }}
                >Quantum</button>
            </div>
            <div className="Dashboard">
                {RenderDashboard()}
            </div>
        </div>
    )
}
export default Dashboard;