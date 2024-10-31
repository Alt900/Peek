import React, {useState} from "react";
import { FetchRoute, StateObject_Handler } from "./utils";
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

function QuantumDash({state,dispatcher,QAE_Params,SetQAE_Params,FIP_Params,SetFIP_Params,Grovers_Params,SetGrovers_Params}){
    let column = 0;
    let row = -1;

    const Quantum_Router = {
        "QASM_Result":`/Run_QASM?Script=${state.OPENQASM_Script}`,
        "Grovers":`/Grovers?qubits=${Grovers_Params.qubits}`,
        "Quantum_Amplitude_Estimation": `/QAE?qubits=${QAE_Params.qubits}&probability=${QAE_Params.probability}&typeof=${QAE_Params.qae_type}`,
        "Fixed_Income_Pricing": `/FIP?high=${FIP_Params.high_bounds}&low=${FIP_Params.low_bounds}&cf=${FIP_Params.cashflow}&epsilon=${FIP_Params.epsilon}&alpha=${FIP_Params.alpha}`
    }

    const [FormKey,SetFormKey] = useState(null);
    const [FormOpen,SetFormOpen] = useState(false);

    const [offset,setoffset] = useState({x:0,y:0})
    const [isdragging,setisdragging] = useState(false);
    const [position, setposition] = useState({x:0,y:0});

    const HandleMouseDown = (event) => {
        setisdragging(true);
        setoffset({x:event.clientX-position.x,y:event.clientY-position.y,});
    };

    const HandleMouseMove = (event) =>{
        if(isdragging){
            setposition({x:event.clientX-offset.x,y:event.clientY-offset.y});
        }
    };

    const HandleMouseUp = () => {
        setisdragging(false);
    };

    const DispatchQuantumForm = () => {
        switch(FormKey){
            case "Quantum_Amplitude_Estimation":
                if(FormOpen){
                    return(
                        <div>
                            <div className="Form" onMouseDown={HandleMouseDown} onMouseMove={HandleMouseMove} onMouseUp={HandleMouseUp} style={{left:`${position.x}px`,top:`${position.y}px`,cursor: isdragging ? 'grabbing' : 'grab',}}>
                                <button className="CloseForm" onClick={()=>{SetFormOpen(false)}}>X</button>
                                <h2 style={{fontSize:"15px"}}>
                                    Quantum Amplitude Estimation Parameters
                                </h2>
                                {
                                    Object.keys(QAE_Params).map((key,_)=>{
                                        return(
                                            <>
                                            <label>{key.replaceAll("_"," ")}</label>
                                            <br/>
                                            <input
                                                className="FormInput"
                                                name={key}
                                                value={QAE_Params[key]}
                                                placeholder={QAE_Params[key]}
                                                onChange={(event)=>StateObject_Handler({key:key,target:event.target},SetQAE_Params)}
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
                                    onClick={()=>{FetchRoute(dispatcher,Quantum_Router["Quantum_Amplitude_Estimation"],"QASM_Result")}}
                                >Run QAE</button>
                            </div>
                        </div>
                    );
                }
            case "Fixed_Income_Pricing":
                if(FormOpen){
                    return(
                        <div>
                            <div className="Form" onMouseDown={HandleMouseDown} onMouseMove={HandleMouseMove} onMouseUp={HandleMouseUp} style={{left:`${position.x}px`,top:`${position.y}px`,cursor: isdragging ? 'grabbing' : 'grab',}}>
                                <button className="CloseForm" onClick={()=>{SetFormOpen(false)}}>X</button>
                                <h2 style={{fontSize:"15px"}}>
                                    Fixed Income Pricing Parameters
                                </h2>
                                {
                                    Object.keys(FIP_Params).map((key,_)=>{
                                        return(
                                            <>
                                            <label>{key.replaceAll("_"," ")}</label>
                                            <br/>
                                            <input
                                                className="FormInput"
                                                name={key}
                                                value={FIP_Params[key]}
                                                placeholder={FIP_Params[key]}
                                                onChange={(event)=>StateObject_Handler({key:key,target:event.target},SetFIP_Params)}
                                            ></input>
                                            <br/>
                                            <br/>
                                            </>
                                        );
                                    })
                                }
                                <button
                                    className="FormButton"
                                    onClick={()=>{FetchRoute(dispatcher,Quantum_Router["Fixed_Income_Pricing"],"QASM_Result")}}
                                >Run FIP</button>
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
                                    Grovers Algorithm Parameters
                                </h2>
                                {
                                    Object.keys(Grovers_Params).map((key,_)=>{
                                        return(
                                            <>
                                            <label>{key.replaceAll("_"," ")}</label>
                                            <br/>
                                            <input
                                                className="FormInput"
                                                name={key}
                                                value={Grovers_Params[key]}
                                                placeholder={Grovers_Params[key]}
                                                onChange={(event)=>StateObject_Handler({key:key,target:event.target},SetGrovers_Params)}
                                            ></input>
                                            <br/>
                                            <br/>
                                            </>
                                        );
                                    })
                                }
                                <button
                                    className="FormButton"
                                    onClick={()=>{FetchRoute(dispatcher,Quantum_Router["Grovers"],"QASM_Result")}}
                                >Run Grovers</button>
                            </div>
                        </div>
                    )
                }
        }
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
                            dispatcher
                        )}
                    }
                value={state.OPENQASM_Script}
                >
                </textarea>
                <button
                className="Run_QASM"
                onClick={
                    ()=>{
                        FetchRoute(dispatcher,Quantum_Router["QASM_Result"],"QASM_Result");
                        console.log(state.QASM_Result)
                    }
                }
                >Run QASM Script</button>
                {console.log(state.QASM_Result)}
                <textarea
                className="QASM_Result"
                name="QASM_Result"
                value={
                    state.QASM_Result===""?
                    "No QASM script has been ran yet":
                    `${Object.keys(state.QASM_Result)}\n${"_ _ _ ".repeat(Object.keys(state.QASM_Result).length)}\n\n${Object.values(state.QASM_Result)}`
                }
                />
            </div>
            <div className="Circuit_Display">
                {DispatchQuantumForm()}
                <DYN_IMG/>
                <div className="QA_Container">
                    {
                        [
                            "Grovers",
                            "Quantum_Amplitude_Estimation",
                            "Fixed_Income_Pricing"
                        ].map((key,index)=>{
                            if(index%2===0 && index!==0){
                                column+=1
                                row=-1
                            }
                            row+=1;
                            return(
                                <button
                                className="QA_Button"
                                onClick={()=>{SetFormKey(key);SetFormOpen(true);}}
                                style={{left:`${row*16}%`,top:`${column*30}%`}}//onclick={render form with parameters and a submit button, the submit button will execute a route and fill the dispatcher on pythons end with the provided map key}
                                >{key.replaceAll("_"," ")}</button>
                            )
                        })
                    }
                </div>
            </div>
        </>
    );
};

export default QuantumDash;