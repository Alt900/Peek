#include "cJSON.h"
#include <stdio.h>
#include <stdlib.h>
#include <Python.h>


static PyObject* Fetch(PyObject *self, PyObject *args){
    const char *filename;
    if(!PyArg_ParseTuple(args,"s",&filename)){
        return NULL;
    }
    
    FILE *F = fopen(filename,"r");
    if (F == NULL){
        return Py_BuildValue("s","Could not open the JSON file");
    }
    fseek(F,0,SEEK_END);
    long len = ftell(F);
    rewind(F);

    char *buffer = (char *)malloc(len+1);
    if(buffer==NULL){
        return Py_BuildValue("s","Could not allocated the memory required to store the JSON file.");
    }
    fread(buffer,1,len,F);
    buffer[len]='\0';
    fclose(F);

    PyObject *result = Py_BuildValue("s",buffer);
    free(buffer);

    return result;
}

static PyObject* GetStartAndEnd(PyObject *self, PyObject *args){
    ///

    const char *filename;
    FILE *F = fopen(filename,"r");
    if (F == NULL){
        return Py_BuildValue("s","Could not open the JSON file");
    }
    fseek(F,0,SEEK_END);
    long len = ftell(F);
    rewind(F);

    char *buffer = (char *)malloc(len+1);
    if(buffer==NULL){
        return Py_BuildValue("s","Could not allocated the memory required to store the JSON file.");
    }
    fread(buffer,1,len,F);
    buffer[len]='\0';
    fclose(F);

    PyObject *result = Py_BuildValue("s",buffer);
    free(buffer);

    ///

    cJSON *JString = cJSON_Parse(buffer);

    free(buffer);

    int size = cJSON_GetArraySize(JString);

    cJSON *Start_Object = cJSON_GetArrayItem(JString,0);
    cJSON *End_Object = cJSON_GetArrayItem(JString,size);

    cJSON *Start = cJSON_GetObjectItem(Start_Object,"timestamp");
    cJSON *End = cJSON_GetObjectItem(End_Object,"timestamp");

    cJSON_Delete(JString);

    PyObject *pylist = PyList_New(0);
    PyList_SetItem(pylist, 0, Py_BuildValue("s",Start -> valueint));
    PyList_SetItem(pylist, 1, Py_BuildValue("s",End -> valueint));

    return pylist;
}

static PyObject* MergeJSON(PyObject *self, PyObject *args){
    const char *String_A, *String_B;
    if(!PyArg_ParseTuple(args,"ss",&String_A,&String_B)){
        return NULL;
    }
    cJSON* Object_A = cJSON_Parse(String_A);
    cJSON* Object_B = cJSON_Parse(String_B);
    if(!Object_A || !Object_B){
        const char* error_pointer = cJSON_GetErrorPtr();
        if(error_pointer){
            return error_pointer;
        }
        return NULL;
    }
    cJSON *Merged = cJSON_CreateObject();
    cJSON_ReplaceItemInObject(Merged,"data_A",Object_A);
    cJSON_ReplaceItemInObject(Merged,"data_B",Object_B);

    char* Merged_String = cJSON_Print(Merged);

    cJSON_Delete(Object_A);
    cJSON_Delete(Object_B);
    cJSON_Delete(Merged);

    return Py_BuildValue("s",Merged_String);
}

static PyMethodDef Functions[] = {
    {"Fetch",Fetch,METH_VARARGS,"Retrieves ticker data"},
    {"GetStartAndEnd",GetStartAndEnd,METH_VARARGS,"Finds the starting and ending date for dynamic cache handling."},
    {"MergeJSON",MergeJSON,METH_VARARGS,"Combines two provided JSON object strings"},
    {NULL,NULL,0,NULL}
};

static struct PyModuleDef ReadJSON = {
    PyModuleDef_HEAD_INIT,
    "ReadJSON",
    NULL,
    -1,
    Functions
};

PyMODINIT_FUNC PyInit_ReadJSON(void){
    return PyModule_Create(&ReadJSON);
}