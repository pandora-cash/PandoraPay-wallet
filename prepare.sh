#copy wasm_exec.js

location=$(which go);
echo $location

path=$(dirname "$location");
path=$(dirname "$path");

echo $path

mkdir ./src/webworkers/dist
cp $path/misc/wasm/wasm_exec.js ./src/webworkers/dist