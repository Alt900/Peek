from . import os, plt, np, args
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

if args["3D_Render_Engine"]=="Blender":
    import bpy
    import bmesh

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
        Circuit.draw(output='mpl')
        plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\Quantum_Circuit.png",transparent=True)
    return execute(Circuit,backend=Simulator).result().get_counts()
    
class Grovers_Algorithm():

    def __init__(self,Qubits):
        
        self.Qubits=Qubits
        self.Qreg=QuantumRegister(Qubits,'q')
        self.Creg=ClassicalRegister(Qubits,'c')
        self.Circuit=QuantumCircuit(self.Qreg,self.Creg)

    def Grovers(self):
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

    def Run(self,probability,QAE_Type,args=[]):
        problem = EstimationProblem(state_preparation=BernoulliA(probability),grover_operator=BernoulliQ(probability),objective_qubits=[0])
        AE = self.QAE_Dispatcher[QAE_Type](args)
        AE_Results = AE.estimate(problem)
        results = AE_Results.estimation
        circuit_construct = AE.construct_circuit(problem)
        transpile(circuit_construct, basis_gates=basis_gates, optimization_level=2).draw("mpl")
        plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\Quantum_Circuit.png",transparent=True)
        return results
    
class Fixed_Income_Pricing():
    def __init__(self,qubits,low,high,epsilon=0.01,alpha=0.05):
        self.qubits=[qubits,qubits]
        self.alpha=alpha
        self.epsilon=epsilon


        self.A=np.eye(qubits)
        self.B=np.zeros(qubits)

        self.low=low
        self.high=high
        self.mu=high
        self.sigma=0.01*np.eye(qubits)

        self.bounds = list(zip(low,high))
        self.u = NormalDistribution(self.qubits,self.mu,self.sigma,self.bounds)

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
        plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\Probability_Density.png",transparent=True)

    def Generate_CF_Bars(self):
        self.cf = [1.0,2.0]
        periods = range(1,len(self.cf)+1)
        plt.bar(periods,self.cf)
        plt.xticks(periods, size=15)
        plt.yticks(size=15)
        plt.grid()
        plt.xlabel("periods", size=15)
        plt.ylabel("cashflow ($)", size=15)
        plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\Cash_Flow.png",transparent=True)

    def Estimate_Real_Values(self):
        cnt = 0
        exact_val = .0
        for x1 in np.linspace(self.low[0],self.high[0],pow(2,self.qubits[0])):
            for x2 in np.linspace(self.low[1],self.high[1],pow(2,self.qubits[1])):
                prob = self.u.probabilities[cnt]
                for t in range(len(self.cf)):
                    exact_val += prob*(self.cf[t]/pow(1+self.B[t],t+1)-(t+1)*self.cf[t]*np.dot(self.A[:,t],np.asarray([x1,x2]))/pow(1+self.B[t],t+2))
                cnt += 1

        c_approx = 0.125
        fixed_income = FixedIncomePricing(
            num_qubits=self.qubits,
            pca_matrix=self.A,
            initial_interests=self.B,
            cash_flow=self.cf,
            rescaling_factor=c_approx,
            bounds=self.bounds,
            uncertainty_model=self.u
        )
        fixed_income._objective.draw("mpl")
        plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\Fixed_Income_Circuit.png",transparent=True)

        problem=fixed_income.to_estimation_problem()

        ae = IterativeAmplitudeEstimation(epsilon_target=self.epsilon,alpha=self.alpha,sampler=Sampler(run_options={"shots":100,"seed":75}))
        results = ae.estimate(problem)
        conf_int = np.array(results.confidence_interval_processed)
        
        return (exact_val,fixed_income.interpret(results),tuple(conf_int))


class ABS():
    def __init__(self,qubits,epsilon=0.01,alpha=0.05):
        self.qubits = [qubits]*2
        self.alpha=alpha
        self.epsilon=epsilon
        self.num_qubits=qubits
        self.S = 2
        self.vol = .4
        self.R = .05
        self.T = 40/365

        self.mu = (self.R-.5*self.vol**2)*self.T+np.log(self.S)
        self.sigma = self.vol*np.sqrt(self.T)
        self.mean = np.exp(self.mu+self.sigma**2/2)
        self.variance = (np.exp(self.sigma**2)-1)*np.exp(2*self.mu+self.sigma**2)
        self.stddev = np.sqrt(self.variance)

        self.low = (np.maximum(0,self.mean-3*self.stddev))*np.ones(2)
        self.high = (self.mean+3*self.stddev)*np.ones(2)
        self.mu=self.mu*np.ones(2)
        self.cov = self.sigma**2*np.eye(2)

        self.u = LogNormalDistribution(num_qubits=self.qubits,mu=self.mu,sigma=self.cov,bounds=(list(zip(self.low,self.high))))

        self.grid_x,self.grid_y,self.grid_z=None,None,None

        self.barrier=2.5

    def Run_Uncertainty_Model(self):
        x = [v[0] for v in self.u.values]
        y = [v[1] for v in self.u.values]
        z=self.u.probabilities

        resolution = np.array([2**n for n in self.qubits]) * 1j
        self.grid_x, self.grid_y = np.mgrid[min(x) : max(x) : resolution[0], min(y) : max(y) : resolution[1]]
        self.grid_z = griddata((x, y), z, (self.grid_x, self.grid_y))

    def FindPayoff(self, strike_a, strike_b):
        weights=[]
        for n in self.qubits:
            for i in range(n):
                weights +=[2**i]

        agg = WeightedAdder(sum(self.qubits),weights)
        ns = agg.num_sum_qubits
        naux = agg.num_qubits - ns - agg._num_state_qubits

        max_value = 2**ns-1
        self.low_ = self.low[0]
        self.high_ = self.high[0]

        mapped_strike_a = (
            (strike_a-2*self.low_)/(self.high_-self.low_)*(2**self.num_qubits-1)
        )

        mapped_strike_b = (
            (strike_b-2*self.low_)/(self.high_-self.low_)*(2**self.num_qubits-1)
        )

        mapped_barrier = (self.barrier-self.low)/(self.high-self.low)*(2**self.num_qubits-1)

        conditions = []
        barrier_threshold = [2] * 2
        naux_conditions = 0
        for i in range(2):
            comparitor = IntegerComparator(self.qubits[i],mapped_barrier[i]+1,geq=False)
            naux_conditions=max(naux_conditions,comparitor.num_ancillas)
            conditions += [comparitor]

        c_approx = .25
        breakpoints = [0,mapped_strike_a,mapped_strike_b]
        slopes=[0,1,0]
        offsets = [0,0,mapped_strike_b-mapped_strike_a]
        fmin = 0
        fmax = mapped_strike_b-mapped_strike_a
        self.objective = LinearAmplitudeFunction(
            ns,
            slopes,
            offsets,
            domain=(0,max_value),
            image=(fmin,fmax),
            rescaling_factor=c_approx,
            breakpoints=breakpoints
        )

        qr_state = QuantumRegister(self.u.num_qubits,"state")
        qr_obj = QuantumRegister(1,"obj")
        ar_sum = AncillaRegister(ns,"sum")
        ar_cond = AncillaRegister(len(conditions)+1,"conditions")
        ar = AncillaRegister(max(naux,naux_conditions,self.objective.num_ancillas),"work")
        self.objective_index = self.u.num_qubits

        self.asian_barrier_spread = QuantumCircuit(qr_state,qr_obj,ar_cond,ar_sum,ar)
        self.asian_barrier_spread.append(self.u,qr_state)
        for i,cond in enumerate(conditions):
            state_qubit = qr_state[(self.qubits*i):(self.qubits*(i+1))]
            self.asian_barrier_spread.append(cond,state_qubit+[ar_cond[i]]+ar[:cond.num_ancillas])
        self.asian_barrier_spread.mcx(ar_cond[:-1],ar_cond[-1])
        self.asian_barrier_spread.append(agg.control(), [ar_cond[-1]]+qr_state[:]+ar_sum[:]+ar[:naux])
        self.asian_barrier_spread.append(self.objective, ar_sum[:]+qr_obj[:]+ar[:self.objective.num_ancillas])
        self.asian_barrier_spread.append(agg.inverse().control(),[ar_cond[-1]]+qr_state[:]+ar[:naux])
        self.asian_barrier_spread.mcx(ar_cond[:-1],ar_cond[-1])

        for j,cond in enumerate(reversed(conditions)):
            i=len(conditions)-j-1
            state_qubit = qr_state[(self.qubits*i):(self.qubits*(i+1))]
            self.asian_barrier_spread.append(
                cond.inverse(),state_qubit+[ar_cond[i]]+ar[:cond.num_ancillas]
            )

        sum_values = np.sum(self.u.values,axis=1)
        payoff = np.minimum(np.maximum(sum_values-strike_a,0),strike_b-strike_a)
        leq_barrier = [np.max(v) <= self.barrier for v in self.u.values]
        exact_value = np.dot(self.u.probabilities[leq_barrier],payoff[leq_barrier])

        return exact_value
    
    def Evaluate_Payoff(self):
        num_state_qubits = self.asian_barrier_spread.num_qubits - self.asian_barrier_spread.num_ancillas

        transpile(self.asian_barrier_spread,basis_gates=["u","cx"]).draw("mpl")
        plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\Quantum_Circuit.png",transparent=True)

        measured = self.asian_barrier_spread.measure_all(inplace=False)
        job = sampler.run(measured)
        value = 0
        probabilities = job.result().qasi_dists[0].binary_probabilities()
        for i,prob in probabilities.items():
            if prob > 1e-4 and i[-num_state_qubits:][0]=="1":
                value += prob

        problem=EstimationProblem(
            state_preparation=self.asian_barrier_spread,
            objective_qubits=[self.objective_index],
            post_processing=self.objective.post_processing
        )

        ae = IterativeAmplitudeEstimation(self.epsilon,alpha=self.alpha,sampler=Sampler(run_options={"shots":100,"seed":75}))
        results = ae.estimate(problem)
        conf_int = (np.array(results.confidence_interval_processed)/(2**self.qubits-1)*(self.high_-self.low_))

        return (results.estimation_processed,tuple(conf_int))


    def Render_Uncertainty_Probability(self):
        if args["3D_Render_Engine"]=="Blender":
            vertices,faces=[],[]

            for i in range(self.grid_x.shape[0]):
                for j in range(self.grid_x.shape[1]):
                    vertices.append((self.grid_x[i,j],self.grid_y[i,j],self.grid_z[i,j]))


            for i in range(self.grid_x.shape[0]-1):
                for j in range(self.grid_x.shape[1]-1):
                    v0 = i*self.grid_x.shape[1]+j
                    v1=v0+1
                    v2=v0+self.grid_x.shape[1]

                    v3=v2+1
                    faces.append((v0,v1,v2))
                    faces.append((v1,v3,v2))

            mesh = bpy.data.meshes.new(name="UncertaintyModelMesh")
            mesh.from_pydata(vertices,[],faces)
            mesh.update()
            object = bpy.data.objects.new("UncertaintyModel",mesh)
            bpy.context.collection.objects.link(object)

            bpy.context.view_layer.objects.active = object
            object.select_set(True)

            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.normals_make_consistent(inside=False)
            bpy.ops.object.mode_set(mode='OBJECT')

            bpy.ops.export_scene.gltf(filepath=os.getcwd()+"\\QuantumRender.glb",export_format='GLB')

        else:
            plt.figure(figsize=(10, 8))
            ax = plt.axes(projection="3d")
            ax.plot_surface(self.grid_x, self.grid_y, self.grid_z, cmap=plt.cm.Spectral)
            ax.set_xlabel("Spot Price $S_1$ (\$)", size=15)
            ax.set_ylabel("Spot Price $S_2$ (\$)", size=15)
            ax.set_zlabel("Probability (\%)", size=15)
            plt.savefig(os.getcwd()+"\\react_gui\\src\\Graphs\\ABS_UMP.png",transparent=True)

class Options_QGAN():
    def __init__(self,qubits):
        self.bounds=np.array([.0,7.0])
        self.qubits=qubits
        self.g_params = [0.29399714, 0.38853322, 0.9557694, 0.07245791, 6.02626428, 0.13537225]