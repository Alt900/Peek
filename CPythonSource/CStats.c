#include <math.h>
#include <Python.h>

#define MAX2(a,b) ((a)>(b)?(a):(b))
#define MAX3(a,b,c) (MAX2(MAX2(a,b),c))


static PyObject* Mean(PyObject *self, PyObject *args){
    PyObject *Array;
    if(!PyArg_ParseTuple(args,"O",&Array)){
        return NULL;
    }
    double sum = .0;
    Py_ssize_t len = PyList_Size(Array);

    for (Py_ssize_t i = 0; i<len; i++){
        PyObject *element = PyList_GetItem(Array,i);
        if(!PyFloat_Check(element)){
            return NULL;
        };
        sum += PyFloat_AsDouble(element);
    };
    return PyFloat_FromDouble(sum/len);
}

static PyObject* Mode(PyObject *self, PyObject *args){
    PyObject *Array; 
    if(!PyArg_ParseTuple(args,"O",&Array)){
        return NULL;
    }
    Py_ssize_t len = PyList_Size(Array);
    Array = PyList_Sort(Array);

    double mode = .0;
    int ModeCount = 0;
    int CurrentCount = 1;
    PyObject *CurrentValue = PyList_GetItem(Array,0);
    for (Py_ssize_t i = 0; i<len; i++){
        PyObject *element = PyList_GetItem(Array,i);
        if(element==CurrentValue){
            CurrentCount++;
        } else {
            CurrentValue=element;
            CurrentCount = 1;
        }
        if(CurrentCount>ModeCount){
            ModeCount=CurrentCount;
            mode=PyFloat_AsDouble(CurrentValue);
        }
    }
    return PyFloat_FromDouble(mode);
}

static PyObject* Median(PyObject *self, PyObject *args){
    PyObject *Array; 
    if(!PyArg_ParseTuple(args,"O",&Array)){
        return NULL;
    }
    Py_ssize_t len = PyList_Size(Array);

    Array = PyList_Sort(Array);
    if(len % 2 != 0){
        return (PyObject*)PyList_GetItem(Array,len/2);
    } else {
        double A = PyFloat_AsDouble((PyObject*)PyList_GetItem(Array,len-1/2));
        double B = PyFloat_AsDouble((PyObject*)PyList_GetItem(Array,len/2));
        return PyFloat_FromDouble(A+B);
    }
}

static PyObject *Variance(PyObject *self, PyObject *args){//pass mean
    PyObject *Array; 
    double mean;
    if(!PyArg_ParseTuple(args,"fO",&mean,&Array)){
        return NULL;
    }
    Py_ssize_t len = PyList_Size(Array);

    double sum = .0;
    for (Py_ssize_t i = 0; i<len; i++){
        PyObject *observed = PyList_GetItem(Array,i);
        double PowerSet = PyFloat_AsDouble(observed) - mean;
        sum += PowerSet*PowerSet;
    }
    return PyFloat_FromDouble(sum/len-1);
}

static PyObject *STD(PyObject *self, PyObject *args){//pass variance
    PyObject *Array; 
    double mean;
    if(!PyArg_ParseTuple(args,"dO",&mean,&Array)){
        return NULL;
    }
    double sum = .0;
    double N = PyList_Size(Array);
    for(int i = 0; i<N; i++){
        sum += pow(PyFloat_AsDouble(PyList_GetItem(Array,i))-mean,2);
    }
    return PyFloat_FromDouble(sqrt(sum/N));
}

static PyObject *EMA(PyObject *self, PyObject *args){
    float Smoothing;
    PyObject *Array;
    if(!PyArg_ParseTuple(args,"fO",&Smoothing,&Array)){
        return NULL;
    }
    Py_ssize_t len = PyList_Size(Array);
    PyObject *Results = PyList_New(len);

    double EMA_Today = .0;
    double EMA_Yesterday = .0;
    for (Py_ssize_t i = 0; i<len; i++){
        double observed = PyFloat_AsDouble(PyList_GetItem(Array,i));
        EMA_Today = (observed*(Smoothing/1+len)) + (EMA_Yesterday*(1-(Smoothing/1+len)));
        EMA_Yesterday = EMA_Today;
        PyList_SetItem(Results,i,PyFloat_FromDouble(EMA_Today));
    }
    return Results;
}

static PyObject *ATR(PyObject *self, PyObject *args){
    PyObject *O,*H,*L,*C;
    if(!PyArg_ParseTuple(args,"OOOO",&O,&H,&L,&C)){
        return NULL;
    }
    Py_ssize_t len = PyList_Size(O)-1;

    double sum = .0;
    for (Py_ssize_t i = 1; i<len; i++){//start at next-interval for previous close
        double TR = MAX3(
            PyFloat_AsDouble(PyList_GetItem(O,i)) - PyFloat_AsDouble(PyList_GetItem(L,i)),
            abs(
                PyFloat_AsDouble(PyList_GetItem(H,i)) - PyFloat_AsDouble(PyList_GetItem(C,i-1))
            ),
            abs(
                PyFloat_AsDouble(PyList_GetItem(L,i)) - PyFloat_AsDouble(PyList_GetItem(C,i-1))
            )
        );
        sum += TR;
    }
    return PyFloat_FromDouble((1/len)*sum);
}

static PyObject *AMA(PyObject *self, PyObject *args){
    float Smoothing;
    PyObject *Array;
    int Nth_Lookback;
    if(!PyArg_ParseTuple(args,"fOi",&Smoothing,&Array,&Nth_Lookback)){
        return NULL;
    }
    Py_ssize_t len = PyList_Size(Array);
    PyObject *Results = PyList_New(len);

    double Efficiency_Ratio = .0;
    double Volatility = .0;
    double Direction = .0;
    float Fast = Smoothing/(Smoothing+1);
    float Slow = Smoothing/(len+1);
    float SC = .0;

    double EMA_Today = .0;
    double EMA_Yesterday = .0;
    PyList_SetItem(Results,0,PyList_GetItem(Array,0));
    for (Py_ssize_t i = 1; i<len-1; i++){
        float element = PyFloat_AsDouble(PyList_GetItem(Array,i));
        float prevelement = PyFloat_AsDouble(PyList_GetItem(Array,i-1));
        float lookbackelement = PyFloat_AsDouble(PyList_GetItem(Array,i-Nth_Lookback));
        float PreviousResults = PyFloat_AsDouble(PyList_GetItem(Results,i-1));

        EMA_Today = (Smoothing/len+1)*(element-EMA_Yesterday)+EMA_Yesterday;
        EMA_Yesterday=EMA_Today;

        //find the smoothing constant
        Volatility = abs(element-prevelement);
        Direction = element-lookbackelement;
        Efficiency_Ratio = abs(Direction/Volatility);
        SC = pow(Efficiency_Ratio*(Fast-Slow)+Slow,2);

        PyList_SetItem(
            Results,
            i,
            PyFloat_FromDouble(SC*(element-PreviousResults)+PreviousResults));
    }
    return Results;
}

static PyMethodDef Functions[] = {
    {"Mean",Mean,METH_VARARGS,""},
    {"Median",Median,METH_VARARGS,""},
    {"Mode",Mode,METH_VARARGS,""},
    {"Variance",Variance,METH_VARARGS,""},
    {"STD",STD,METH_VARARGS,"Standard deviation"},
    {"EMA",EMA,METH_VARARGS,"Exponential moving average"},
    {"ATR",ATR,METH_VARARGS,"Average true range"},
    {"AMA",AMA,METH_VARARGS,"Adaptive moving average"},
    {NULL,NULL,0,NULL}
};

static struct PyModuleDef CStats = {
    PyModuleDef_HEAD_INIT,
    "CStats",
    NULL,
    -1,
    Functions
};

PyMODINIT_FUNC PyInit_CStats(void){
    return PyModule_Create(&CStats);
}