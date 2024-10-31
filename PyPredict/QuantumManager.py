from . import os, plt, np, filesystem
from qiskit import QuantumRegister, ClassicalRegister, QuantumCircuit, AncillaRegister, Aer, execute, transpile

#Quantum Amplitude Estimator
import qiskit_algorithms
from qiskit_algorithms import IterativeAmplitudeEstimation, EstimationProblem
from qiskit_aer.primitives import Sampler

#Asian Barrier
from qiskit_finance.circuit.library import LogNormalDistribution, NormalDistribution
from qiskit.circuit.library import IntegerComparator, WeightedAdder, LinearAmplitudeFunction
from scipy.interpolate import griddata

#pricing fixed income assets
from qiskit_finance.applications.estimation import FixedIncomePricing


Simulator = Aer.get_backend('qasm_simulator')
sampler = Sampler()
basis_gates = ["h", "ry", "cry", "cx", "ccx", "p", "cp", "x", "s", "sdg", "y", "t", "cz"]

class BernoulliA(QuantumCircuit):
    def __init__(self,probability):
        super().__init__(1)
        theta_p = 2 * np.arcsin(np.sqrt(probability))
        self.ry(theta_p,0)

class BernoulliQ(QuantumCircuit):
    def __init__(self,probability):
        super().__init__(1)
        self._theta_p = 2 * np.arcsin(np.sqrt(probability))
        self.ry(2*self._theta_p,0)
    def power(self,k):
        q_k = QuantumCircuit(1)
        q_k.ry(2*k*self._theta_p,0)
        return q_k



Compile_QASM = lambda Script :execute(
    QuantumCircuit.from_qasm_str(Script),
    backend=Simulator
)

def RunCircuit(Circuit,Generate_Graph=False,From_QASM=False,QASM=None):
    if From_QASM:
        Circuit=QuantumCircuit.from_qasm_str(QASM)
    if Generate_Graph:
        plt.figure(figsize=(7,7))
        Circuit.draw(output='mpl')
        plt.savefig(os.getcwd()+f"{filesystem}react_gui{filesystem}src{filesystem}Graphs{filesystem}Quantum_Circuit.png",transparent=True)
    return execute(Circuit,backend=Simulator).result().get_counts()
    
class Grovers_Algorithm():

    def __init__(self,Qubits):
        
        self.Qubits=Qubits
        self.Qreg=QuantumRegister(Qubits,'q')
        self.Creg=ClassicalRegister(Qubits,'c')
        self.Circuit=QuantumCircuit(self.Qreg,self.Creg)

    def Call(self):
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
        self.Circuit.draw(output='mpl')
        plt.savefig(os.getcwd()+f"{filesystem}react_gui{filesystem}src{filesystem}Graphs{filesystem}Quantum_Circuit.png",transparent=True)
        return execute(self.Circuit,backend=Simulator).result().get_counts()
    

class QAE():
    def __init__(self,Qubits):

        self.Qubits=Qubits
        self.Qreg=QuantumRegister(Qubits,'q')
        self.Creg=ClassicalRegister(Qubits,'c')
        self.Circuit=QuantumCircuit(self.Qreg,self.Creg)
        self.QAE_Dispatcher = {
            "Canonical": lambda _ : qiskit_algorithms.AmplitudeEstimation(num_eval_qubits=Qubits,sampler=sampler),
            "Iterative": lambda args : IterativeAmplitudeEstimation(epsilon_target=args[0],alpha=args[1],sampler=sampler),
            "Maximum": lambda args : qiskit_algorithms.MaximumLikelihoodAmplitudeEstimation(evaluation_schedule=args[0],sampler=sampler),
            "Faster": lambda args : qiskit_algorithms.FasterAmplitudeEstimation(delta=args[0],maxiter=args[1],sampler=sampler)
        }

    def Call(self,probability,QAE_Type,args=[]):
        problem = EstimationProblem(state_preparation=BernoulliA(probability),grover_operator=BernoulliQ(probability),objective_qubits=[0])
        AE = self.QAE_Dispatcher[QAE_Type](args)
        AE_Results = AE.estimate(problem)
        results = AE_Results.estimation
        circuit_construct = AE.construct_circuit(problem)
        transpile(circuit_construct).draw(output='mpl')
        plt.savefig(os.getcwd()+f"{filesystem}react_gui{filesystem}src{filesystem}Graphs{filesystem}Quantum_Circuit.png",transparent=True)
        return results
    
class Fixed_Income_Pricing():
    def __init__(self,low,high,cf,epsilon=0.01,alpha=0.05):
        self.qubits=2
        self.num_qubits=[2,2]
        self.alpha=alpha
        self.epsilon=epsilon


        self.A=np.eye(2)
        self.B=np.zeros(2)

        self.low=low
        self.high=high
        self.mu=high
        self.cf=cf
        self.sigma=0.01*np.eye(2)

        self.bounds = list(zip(low,high))
        self.u = NormalDistribution(self.num_qubits,self.mu,self.sigma,self.bounds)

    def Generate_ProbDensity_Countour(self):
        x = np.linspace(self.low[0],self.high[0],2**self.qubits[0])
        y = np.linspace(self.low[1],self.high[1],2**self.qubits[1])
        z = self.u.probabilities.reshape(2**self.qubits[0],2**self.qubits[1])

        plt.contour(x,y,z)
        plt.xticks(x,size=15)
        plt.yticks(y,size=15)
        plt.grid()
        plt.xlabel("$r_1$ (%)", size=15)
        plt.ylabel("$r_2$ (%)", size=15)
        plt.colorbar()
        plt.savefig(os.getcwd()+f"{filesystem}react_gui{filesystem}src{filesystem}Graphs{filesystem}Probability_Density.png",transparent=True)

    def Generate_CF_Bars(self):
        self.cf = [1.0,2.0]
        periods = range(1,len(self.cf)+1)
        plt.bar(periods,self.cf)
        plt.xticks(periods, size=15)
        plt.yticks(size=15)
        plt.grid()
        plt.xlabel("periods", size=15)
        plt.ylabel("cashflow ($)", size=15)
        plt.savefig(os.getcwd()+f"{filesystem}react_gui{filesystem}src{filesystem}Graphs{filesystem}Cash_Flow.png",transparent=True)

    def Call(self):
        cnt = 0
        exact_val = .0
        for x1 in np.linspace(self.low[0],self.high[0],pow(2,self.num_qubits[0])):
            for x2 in np.linspace(self.low[1],self.high[1],pow(2,self.num_qubits[1])):
                prob = self.u.probabilities[cnt]
                for t in range(len(self.cf)):
                    exact_val += prob*(self.cf[t]/pow(1+self.B[t],t+1)-(t+1)*self.cf[t]*np.dot(self.A[:,t],np.asarray([x1,x2]))/pow(1+self.B[t],t+2))
                cnt += 1

        c_approx = 0.125
        fixed_income = FixedIncomePricing(
            num_qubits=self.num_qubits,
            pca_matrix=self.A,
            initial_interests=self.B,
            cash_flow=self.cf,
            rescaling_factor=c_approx,
            bounds=self.bounds,
            uncertainty_model=self.u
        )
        fixed_income._objective.draw("mpl")
        plt.savefig(os.getcwd+f"{filesystem}react_gui{filesystem}src{filesystem}Graphs{filesystem}Quantum_Circuit.png",transparent=True)

        problem=fixed_income.to_estimation_problem()

        ae = IterativeAmplitudeEstimation(epsilon_target=self.epsilon,alpha=self.alpha,sampler=Sampler(run_options={"shots":100,"seed":75}))
        results = ae.estimate(problem)
        conf_int = np.array(results.confidence_interval_processed)
        
        return (exact_val,fixed_income.interpret(results),tuple(conf_int))