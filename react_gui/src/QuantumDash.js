import React, { useReducer } from "react";
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
    const Quantum_Object = {
        OPENQASM_Script: "OPENQASM 2.0;\ninclude 'qelib1.inc';\nqreg q[4];\ncreg c[4];",
        QASM_Result: ""
    }

    const [Quantum_State,Set_QuantumState] = useReducer(Object_Reducer,Quantum_Object);

    const Quantum_Router = {
        "QASM_Result":`https:///127.0.0.1:5000/Run_QASM?Script=${Quantum_State.OPENQASM_Script}`,
        "Grovers_Result":`https://127.0.0.1:5000/Run_Grovers`
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