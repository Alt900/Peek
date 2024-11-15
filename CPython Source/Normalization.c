#include <Python.h>
#include <math.h>

PyObject *Logarithmic(PyObject *self, PyObject *args){
    PyObject *Array;
    PyObject *Normalized;
    Py_ssize_t len, i;
    if(!PyArg_ParseTuple(args,"O", &Array)){
        return NULL;
    }
    len = PyList_Size(Array);
    Normalized = PyList_New(len);
    for(i = 0; i<len; i++){
        float Value = log(PyFloat_AsDouble(PyList_GetItem(Array,i)));
        PyList_SetItem(Normalized,i,PyFloat_FromDouble(Value));
    }
    return Normalized;
}

PyObject *MinMax(PyObject *self, PyObject *args){
    PyObject *Array;
    PyObject *Normalized;
    Py_ssize_t len, i;
    double Min, Max;
    if(!PyArg_ParseTuple(args,"Odd", &Array, &Min, &Max)){
        return NULL;
    }
    len = PyList_Size(Array);
    Normalized = PyList_New(len);
    for(int i = 0; i<len; i++){
        double N = PyFloat_AsDouble(PyList_GetItem(Array,i));
        PyList_SetItem(Normalized,i, PyFloat_FromDouble((N-Min)/(Max-Min)));
    }
    return Normalized;
}

PyObject *Z_Score(PyObject *self, PyObject *args){
    PyObject *Array;
    PyObject *Normalized;
    Py_ssize_t len;
    double Mean, Std;
    if(!PyArg_ParseTuple(args,"Odd", &Array, &Mean, &Std)){
        return NULL;
    }
    len = PyList_Size(Array);
    Normalized = PyList_New(len);
    for(Py_ssize_t i = 0; i<len; i++){
        double N = PyFloat_AsDouble(PyList_GetItem(Array,i));
        PyList_SetItem(Normalized,i,PyFloat_FromDouble((N-Mean)/Std));
    }
    return Normalized;
}

PyObject *Logarithmic_Denorm(PyObject *self, PyObject *args){
    PyObject *NormalizedArray;
    PyObject *DeNormalized;
    Py_ssize_t len;
    if(!PyArg_ParseTuple(args,"O", &NormalizedArray)){
        return NULL;
    }
    len = PyList_Size(NormalizedArray);
    DeNormalized = PyList_New(len);
    for(Py_ssize_t i = 0; i<len; i++){
        float N = PyFloat_AsDouble(PyList_GetItem(NormalizedArray,i));
        PyList_SetItem(DeNormalized,i,PyFloat_FromDouble(exp(N)));
    }
    return DeNormalized;
}

PyObject *MinMax_Denorm(PyObject *self, PyObject *args){
    PyObject *Normalized;
    PyObject *DeNormalized;
    Py_ssize_t len;
    double Min, Max;
    if(!PyArg_ParseTuple(args,"Odd", &Normalized, &Min, &Max)){
        return NULL;
    }
    len = PyList_Size(Normalized);
    DeNormalized = PyList_New(len);
    for(Py_ssize_t i = 0; i<len; i++){
        double N = PyFloat_AsDouble(PyList_GetItem(Normalized,i));
        PyList_SetItem(DeNormalized,i,PyFloat_FromDouble(N*(Max-Min)+Min));
    }
    return DeNormalized;
}

PyObject *Z_Score_Denorm(PyObject *self, PyObject *args){
    PyObject *NormalizedArray;
    PyObject *DeNormalized;
    Py_ssize_t len;
    double Mean,Std;
    if(!PyArg_ParseTuple(args,"Odd", &NormalizedArray, &Mean, &Std)){
        return NULL;
    }
    len = PyList_Size(NormalizedArray);
    DeNormalized = PyList_New(len);
    for(Py_ssize_t i = 0; i<len; i++){
        double N = PyFloat_AsDouble(PyList_GetItem(NormalizedArray,i));
        PyList_SetItem(DeNormalized,i,PyFloat_FromDouble((N*Std)+Mean));
    }
    return DeNormalized;
}

static PyMethodDef NormalizationMethods[] = {
    {"Logarithmic",Logarithmic,METH_VARARGS,"Logarithmic normalization"},
    {"MinMax",MinMax,METH_VARARGS,"Min/Max normalization"},
    {"Z_Score",Z_Score,METH_VARARGS,"Z_Score normalization"},
    {"Z_Score_Denorm",Z_Score_Denorm,METH_VARARGS,"Z_Score de-normalization"},
    {"MinMax_Denorm",MinMax_Denorm,METH_VARARGS,"Min/Max denormalization"},
    {"Logarithmic_Denorm",Logarithmic_Denorm,METH_VARARGS,"Logarithmic de-normalization"},
    {NULL,NULL,0,NULL}
};

static struct PyModuleDef Normalization = {
    PyModuleDef_HEAD_INIT,
    "Normalization",
    NULL,
    -1,
    NormalizationMethods
};

PyMODINIT_FUNC PyInit_Normalization(void) {
    return PyModule_Create(&Normalization);
}