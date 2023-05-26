dir="../go-pandora-pay"
name="PandoraPay-wallet"

#copy wasm_exec.js

mkdir -p "./src/webworkers/dist"
cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" "./src/webworkers/dist"

# build wasm

(cd ${dir} && ./scripts/build-wasm.sh main dev )
(cd ${dir} && ./scripts/build-wasm.sh helper dev )

# copy wasm to dist/dev

cp ${dir}/bin/wasm/pandora-helper-dev.wasm ./dist/dev/wasm/${name}-helper.wasm
cp ${dir}/bin/wasm/pandora-main-dev.wasm ./dist/dev/wasm/${name}-main.wasm