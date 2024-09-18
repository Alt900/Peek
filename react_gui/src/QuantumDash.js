import React, { useReducer, useState } from "react";
import { Object_Reducer, FetchRoute, StateObject_Handler } from "./utils";
import CircuitSrc from './Graphs/Quantum_Circuit.png';

const DYN_IMG = () => {
    return(
        <img
            className="Circuit_Image"
            src = {CircuitSrc}
            alt="No quantum circuit has been ran yet"
        />
    )
}

function QuantumDash(){

    const [ShowPopup, setShowPopup] = useState(false);

    const [Iterative_Args,Set_Iterative_Args] = useState({
        epsilon_target:0.01,
        alpha:0.05
    })

    const [Maximum_Args,Set_Maximum_Args] = useState({
        evaluation_schedule:3
    })

    const [Faster_Args,Set_Faster_Args] = useState({
        delta:0.01,
        maxiter:3
    })

    const Quantum_Object = {
        OPENQASM_Script: "OPENQASM 2.0;\ninclude 'qelib1.inc';\nqreg q[4];\ncreg c[4];",
        QASM_Result: "",
        QAE_Type: "Canonical",
        QAE_Qubits: 2,
        QAE_Probability: 0.2,
        QAE_Args: []
    }

    const HandleFormChange = (event,Dispatcher) => {
        const {name,value} = event.target;
        Dispatcher((PrevState)=>({
            ...PrevState,
            [name]:value
        }));
    };

    const HandleFormSubmit = (event,key) => {
        event.preventDefault();
        setShowPopup(false);
        FetchRoute(Quantum_Router,Set_QuantumState,key,"QASM_Result")
    }

    const [Quantum_State,Set_QuantumState] = useReducer(Object_Reducer,Quantum_Object);

    const Quantum_Router = {
        "QASM_Result":`https:///127.0.0.1:5000/Run_QASM?Script=${Quantum_State.OPENQASM_Script}`,
        "Grovers":`https://127.0.0.1:5000/Run_Grovers`,
        "QAE":`https://127.0.0.1:5000/RunQAE?type=${Quantum_State.QAE_Type}
            &Qubits=${Quantum_State.QAE_Qubits}
            &Probability=${Quantum_State.QAE_Probability}
            &Args=${Quantum_State.QAE_Args}
        `
    }


    return(
        <>
            <div className="QASM_editor">
                <h4 className="QASM_Title">OPEN QASM 2.0 Editor</h4>
                <textarea 
                className="QASM"
                name="OPENQASM_Script"
                onChange={
                    (event)=>{
                        StateObject_Handler(
                            {key:"OPENQASM_Script",target:event.target},
                            Set_QuantumState
                        )}
                    }
                value={Quantum_State.OPENQASM_Script}
                >
                </textarea>
                <button
                className="Run_QASM"
                onClick={
                    ()=>{
                        FetchRoute(Quantum_Router,Set_QuantumState,"QASM_Result","QASM_Result");
                        console.log(Quantum_State.QASM_Result)
                    }
                }
                >Run QASM Script</button>
                <textarea
                className="QASM_Result"
                name="QASM_Result"
                value={
                    Quantum_State.QASM_Result===""?
                    "No QASM script has been ran yet":
                    `${Object.keys(Quantum_State.QASM_Result)}\n${"_ _ _ ".repeat(Object.keys(Quantum_State.QASM_Result).length)}\n\n${Object.values(Quantum_State.QASM_Result)}`
                }
                />
            </div>
            <div className="Circuit_Display">
                <DYN_IMG/>
            </div>
            <div className="Quantum_Buttons">
                {
                    [
                        "Canonical_QAE",
                        "Iterative_QAE",
                        "Maximum_QAE",
                        "Faster_QAE",
                        "Grovers"
                    ].map((key,index)=>{
                        <button 
                        key={index}
                        onClick={()=>{
                            setShowPopup(true)
                        }}
                        >{key.replaceAll("_"," ")}</button>
                        {ShowPopup && (
                            <div className="QuantumArgsContainer">
                                <form onSubmit={HandleFormSubmit}>
                                    {()=>{
                                        switch(key){
                                            case "Iterative_QAE":
                                            Iterative_Args.keys().map((subkey,_)=>(
                                                <>
                                                    <label>subkey
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name={subkey}
                                                        value={Iterative_Args[subkey]}
                                                        onChange={(event)=>{HandleFormChange(event,Set_Iterative_Args)}}
                                                    />
                                                    <br/>
                                                </>
                                            ))
                                            case "Maximum_QAE":
                                            Maximum_Args.keys().map((subkey,_)=>{
                                                <>
                                                    <label>subkey</label>
                                                    <input
                                                        type="number"
                                                        value={Maximum_Args[subkey]}
                                                        onChange={(event)=>{HandleFormChange(event,Set_Maximum_Args)}}
                                                    />
                                                    <br/>
                                                </>
                                            })
                                            case "Faster_QAE":
                                            Faster_Args.keys().map((subkey,_)=>{
                                                <>
                                                    <label>subkey</label>
                                                    <input
                                                        type="number"
                                                        value={Faster_Args[subkey]}
                                                        onChange={(event)=>{HandleFormChange(event,Set_Faster_Args)}}
                                                    />
                                                    <br/>
                                                </>
                                            })
                                            default://Canonical_QAE
                                            <>
                                            </>
                                        }
                                    }}
                                </form>    
                            </div>
                        )}
                    })
                }
            </div>
            <button
                className="Grovers_Algorithm"
                onClick={
                    ()=>{
                        FetchRoute(Quantum_Router,Set_QuantumState,"Grovers_Result","QASM_Result")
                    }
                }
            >Run Grovers algorithm</button>
        </>
    );
};

export default QuantumDash;