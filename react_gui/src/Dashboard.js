import React, { useState } from "react";

function Dashboard(){
    const [DashboardSelected, SetSelctedDashboard] = useState("Machine Learning");

    const [payload, setpayload] = useState(null);

    const [ML_State, Set_ML_State] = useState({
        GraphLoss: 1,
        Epochs: 100,
        Batch_Size: 32,
        Window_Size: 5,
        Learning_Rate: 0.0001,
    });

    const [Quantum_State, Set_Quantum_State] = useState({
        OPENQASM_Script: "OPENQASM 2.0;\ninclude 'qelib1.inc';\ncreg q[4];\ncreg c[4];"
    })

    const Handle_ML_State = (New_ML_State,IntOnly=false) => {
        if (IntOnly){
            const regex = /^-?\d*$/;
            if (regex.test(New_ML_State.target.value)){
                Set_ML_State({
                    ...ML_State,
                    [New_ML_State.target.name]: New_ML_State.target.value,
                });
            }
        } else {
            Set_ML_State({
                ...ML_State,
                [New_ML_State.target.name]: New_ML_State.target.value,
            });
        }
    };

    const Handle_Quantum_States = (New_QuantumState) => {
        Set_Quantum_State({
            ...New_QuantumState,
            [New_QuantumState.target.name]: New_QuantumState.target.value,
        });
    }

    const API_Router = {
        "Train_Univariate": "http://127.0.0.1:5000/Train_Univariate",
        "Train Multivariate": "http://127.0.0.1:5000/Train_Multivariate",
        "Call_Univariate": "http://127.0.0.1:5000/Call_Univariate",
        "Call_Multivariate": "http://127.0.0.1:5000/Call_Multivariate"
    }

    const DashboardNavigation = (NewDashboard) => {
        SetSelctedDashboard(NewDashboard);
        RenderDashboard();
    };

    const Router = async (RequestedRout)=>{
        try{
            const resp = await fetch(API_Router[RequestedRout]);
            if (!resp.ok){
                console.error(`There was an error fetching a rout to ${RequestedRout}`)
            }
            const data = await resp.json();
            setpayload(data);
        } catch (err){
            console.log(`There was an error reading the response json\n${err}`);
        }
    };

    const LockTrainCalls = () => {
        return(
            <div className="LockCover">
                <h3>
                    The rest of the model training and calling options are temporarily unavailable as the model trains or predicts
                </h3>
            </div>
        )
    }

    const HandleRouter = (RequestedRout) => {
        LockTrainCalls();
        Router(RequestedRout);
    }

    //for train univariate LSTM and Multivariate LSTM 
    //the parameters side of the dashboard will contain a 
    //dropdown for what variables will be used for the 
    //univariate and multivariate LSTMs

    function RenderDashboard(){//change the color of the CSS button 
        switch(DashboardSelected) {
            case "Machine Learning":
                return(
                <div>
                    <div className="ML_Operations">
                        <button className="MLOpButtons" onClick={HandleRouter("Train_Univariate")}>Train univariate LSTM</button>
                    </div>
                    <div className="ML_Parameters">
                        <h5 style={{left:"0"}} className="ML_ParameterLabel">Epochs : </h5>
                        <textarea
                        className="ML_TextAreas"
                        onChange={(text)=>{Handle_ML_State(text,true)}}
                        value={ML_State.Epochs}
                        style = {{
                            left: "0%"
                        }}
                        ></textarea>
                        <h5 className="ML_ParameterLabel" style={{left:"8%"}}>Batch Size :</h5>
                        <textarea
                        className="ML_TextAreas"
                        onChange={(text)=>{Handle_ML_State(text,true)}}
                        value={ML_State.Batch_Size}
                        style = {{
                            left: "8%"
                        }}
                        >
                        </textarea>
                        <h5 className="ML_ParameterLabel" style={{left:"18%"}}>Window Size:</h5>
                        <textarea
                            className="ML_TextAreas"
                            style={{left:"18%"}}
                            value={ML_State.Window_Size}
                            onChange={(text)=>{Handle_ML_State(text)}}
                        ></textarea>
                    </div>
                </div>)
    
            case "Statistics":
                return(
                    <div className="Statistics_dash">
                    </div>
                )

            case "Quantum":
                return (
                    <div className="QuantumDash">
                        <div className="QASM_editor">
                            <textarea 
                            className="QASM"
                            onChange={(text)=>{Handle_Quantum_States(text)}}
                            value={Quantum_State.OPENQASM_Script}
                            >
                            </textarea>
                            <h4 className="QASM_Title">OPEN QASM 2.0 Editor</h4>
                        </div>
                    </div>
                )
    
            default:
                return(
                    <div className="Download_Dash">
                    </div>
                )
        }
    }

    return (
        <div className="Dashboard_Container">
            <div className="Tleft_Shadow"></div>
            <div className="Dashboard_Shadow"></div>
            <div className="TabsContainer">
                <button 
                className="Tabs"
                onClick={()=>{DashboardNavigation("Machine Learning")}}
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
                onClick={()=>{DashboardNavigation("Data Download")}}
                style={{
                    left:"20%"
                }}
                >Data Download</button>
                <button 
                className="Tabs"
                onClick={()=>{
                    DashboardNavigation("Quantum")

                }}
                style={{
                    left:"30%"
                }}
                >Experimental Quantum Algorithms</button>
            </div>
            <div className="Dashboard">
                {RenderDashboard()}
            </div>
        </div>
    )
}
export default Dashboard;