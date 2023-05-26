dir="../go-pandora-pay"
name="PandoraPay-wallet"

(cd ${dir} && ./scripts/build-wasm.sh main build zopfli brotli )
(cd ${dir} && ./scripts/build-wasm.sh helper build zopfli brotli )

# copy wasm to dist/build

cp ${dir}/bin/wasm/pandora-helper-build.wasm ./dist/build/wasm/${name}-helper.wasm
cp ${dir}/bin/wasm/pandora-helper-build.wasm.gz ./dist/build/wasm/${name}-helper.wasm.gz
cp ${dir}/bin/wasm/pandora-helper-build.wasm.br ./dist/build/wasm/${name}-helper.wasm.br

cp ${dir}/bin/wasm/pandora-main-build.wasm ./dist/build/wasm/${name}-main.wasm
cp ${dir}/bin/wasm/pandora-main-build.wasm.gz ./dist/build/wasm/${name}-main.wasm.gz
cp ${dir}/bin/wasm/pandora-main-build.wasm.br ./dist/build/wasm/${name}-main.wasm.br

# build production

npm run build