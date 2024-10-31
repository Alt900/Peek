from setuptools import setup, Extension

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

FileDesc = Files["Normalization"]
print(FileDesc)
module = Extension(FileDesc["name"], sources=[FileDesc["source"]])
print(module)
setup(
    name=FileDesc["name"],
    version=FileDesc["version"],
    description=FileDesc["description"],
    ext_modules=[module],
)