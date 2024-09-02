from qiskit import QuantumRegister, ClassicalRegister, QuantumCircuit, Aer, transpile, assemble, execute

Simulator = Aer.get_backend('qasm_simulator')

def Generate_QuantumSalt(hash_length):
    qreg_q = QuantumRegister(hash_length, 'q')
    creg_c = ClassicalRegister(hash_length, 'c')
    circuit = QuantumCircuit(qreg_q, creg_c)
    for x in range(hash_length):
        circuit.h(qreg_q[x])
        circuit.measure(qreg_q[x],creg_c[0])

    transpiled = transpile(circuit,Simulator)
    qobj = assemble(transpiled)
    return execute(qobj, backend=Simulator).result().get_counts()

Run_QASMScript = lambda Script :execute(
                                    QuantumCircuit.from_qasm_str(Script),
                                    backend=Simulator
                                ).result().get_counts()

