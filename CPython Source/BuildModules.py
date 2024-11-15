from setuptools import setup, Extension
import sys

os_args=[]
if sys.platform == "darwin":
    os_args = ["-stdlib=libc++", "-mmacosx-version-min=10.9"]
elif sys.platform == "win32":
    os_args = ["/D_WINDOWS"]

Files = {
    "Normalization":{
        "source":"Normalization.c",
        "name": "Normalization",
        "description": "Normalization library",
        "version": "1.0",
    },
    "CStats":{
        "source":"CStats.c",
        "name": "CStats",
        "description": "Statistics library",
        "version": "1.0",
    },
    "ReadJSON":{
        "source":"ReadJSON.c",
        "name": "ReadJSON",
        "description": "JSON handling library",
        "version": "1.0",
    },
}

FileDesc = Files["CStats"]
module = Extension(FileDesc["name"], sources=[FileDesc["source"]], extra_compile_args=os_args)
setup(
    name=FileDesc["name"],
    version=FileDesc["version"],
    description=FileDesc["description"],
    ext_modules=[module],
)