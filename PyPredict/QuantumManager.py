from . import os, plt
from qiskit import QuantumRegister, ClassicalRegister, QuantumCircuit, Aer, execute

Simulator = Aer.get_backend('qasm_simulator')

Compile_QASM = lambda Script :execute(
    QuantumCircuit.from_qasm_str(Script),
    backend=Simulator
)

def RunCircuit(Circuit,Generate_Graph=False,From_QASM=False,QASM=None):
    if From_QASM:
        Circuit=QuantumCircuit.from_qasm_str(QASM)
    if Generate_Graph:
        Circuit.draw(output='mpl')
        plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\Quantum_Circuit.png",transparent=True)
    return execute(Circuit,backend=Simulator).result().get_counts()

class Cryptographic_Algorithms():

    def __init__(self,Qubits):
        self.Qubits=Qubits
        self.Qreg=QuantumRegister(Qubits,'q')
        self.Creg=ClassicalRegister(Qubits,'c')
        self.Circuit=QuantumCircuit(self.Qreg,self.Creg)

    def Generate_QuantumSalt(self):
        for x in range(self.Qubits):
            self.Circuit.h(self.Qreg[x])
            self.Circuit.measure(self.Qreg[x],self.Creg[0])
    
class Financial_Algorithms():

    def __init__(self,Qubits):
        self.Qubits=Qubits
        self.Qreg=QuantumRegister(Qubits,'q')
        self.Creg=ClassicalRegister(Qubits,'c')
        self.Circuit=QuantumCircuit(self.Qreg,self.Creg)

    def Grovers(self):
        """
        ___IN MACHINE LEARNING HYPERPARAMETER USE CASES___
        Here, Grover's algorithm is used to find the best hyperparameter solution like classical ml.
        The oracle marks the optimal hyperparameters based on the lowest entropy state (for hyperparameters
        this would be the lowest loss function result) by flipping its amplitude to be a high-energy state.
        Once the optimal parameters are marked the optimal hyperparameter's amplitudes need to be 
        amplified while the lower-energy amplitudes needs to be diminished, the diffusion layer carries
        out this operation and mesurements are applied to all gates, then the qubit with the most optimal 
        metrics is chosen from the counts results and that hyperparameter is chosen and sent to the model.
        """
        #initialize nth hadamards over the entire quantum registry
        self.Circuit.h(self.Qreg)
        #Initializing oracle state
        Oracle = '1' * self.Qubits #|11111....N>
        for Index,State in enumerate(Oracle):
            if State=='0':
                self.Circuit.x(self.Qreg[Index])
        self.Circuit.cz(self.Qreg[0],self.Qreg[self.Qubits-1])
        for Index,State in enumerate(Oracle):
            if State=='0':
                self.Circuit.x(self.Qreg[Index])
        #diffusion layer

        self.Circuit.h(self.Qreg)
        self.Circuit.x(self.Qreg)
        self.Circuit.h(self.Qreg[-1])
        self.Circuit.mcx(self.Qreg[:-1], self.Qreg[-1])  #Multi-controlled x gate over n-1 qubits
        self.Circuit.h(self.Qreg[-1])
        self.Circuit.x(self.Qreg)
        self.Circuit.h(self.Qreg)
        self.Circuit.measure_all()