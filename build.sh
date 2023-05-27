dir="../go-pandora-pay"
name="PandoraPay-wallet"
mode="dev"
compression=""
compressionWebpack=" --skip-zip "
helper=true

if [[ "$*" == *build* ]]; then
  mode="build"
fi

if [[ "$*" == *compression* ]]; then
  compression=" zopfli brotli "
  compressionWebpack=" "
fi

if [[ "$*" == *no-helper* ]]; then
  helper=false
fi

#copy wasm_exec.js

cp "$(go env GOROOT)/misc/wasm/wasm_exec.js" "./src/webworkers/dist"

(cd ${dir} && ./scripts/build-wasm.sh main ${mode} ${compression} )

# copy wasm to dist/build

rm ./dist/${mode}/wasm/${name}-main.wasm* 2>/dev/null
rm ./dist/${mode}/wasm/${name}-helper.wasm* 2>/dev/null

cp ${dir}/bin/wasm/pandora-main-${mode}.wasm ./dist/${mode}/wasm/${name}-main.wasm

if [[ "$*" == *compression* ]]; then
  cp ${dir}/bin/wasm/pandora-main-${mode}.wasm.gz ./dist/${mode}/wasm/${name}-main.wasm.gz 2>/dev/null
  cp ${dir}/bin/wasm/pandora-main-${mode}.wasm.br ./dist/${mode}/wasm/${name}-main.wasm.br 2>/dev/null
fi


if $helper ; then
  (cd ${dir} && ./scripts/build-wasm.sh helper ${mode} ${compression} )
  cp ${dir}/bin/wasm/pandora-helper-${mode}.wasm ./dist/${mode}/wasm/${name}-helper.wasm

  if [[ "$*" == *compression* ]]; then
    cp ${dir}/bin/wasm/pandora-helper-${mode}.wasm.gz ./dist/${mode}/wasm/${name}-helper.wasm.gz 2>/dev/null
    cp ${dir}/bin/wasm/pandora-helper-${mode}.wasm.br ./dist/${mode}/wasm/${name}-helper.wasm.br 2>/dev/null
  fi
fi

if [[ "$*" == *webpack* ]]; then
    npm run build-ui ${compressionWebpack} -- --mode=production
    npm run build-webworker-wasm ${compressionWebpack} -- --mode=production
fi