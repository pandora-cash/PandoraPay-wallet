dir="../go-pandora-pay"
name="pandora"
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

(cd ${dir} && ./scripts/build-wasm.sh main ${mode} ${compression} )

# copy wasm to dist/build

find ./dist/${mode}/wasm/ -name "*.gz" -type f -delete
find ./dist/${mode}/wasm/ -name "*.br" -type f -delete

cp ${dir}/bin/wasm/${mode}/${name}-main.wasm ./dist/${mode}/wasm/${name}-main.wasm

if [[ "$*" == *compression* ]]; then
  cp ${dir}/bin/wasm/${mode}/${name}-main.wasm.gz ./dist/${mode}/wasm/${name}-main.wasm.gz 2>/dev/null
  cp ${dir}/bin/wasm/${mode}/${name}-main.wasm.br ./dist/${mode}/wasm/${name}-main.wasm.br 2>/dev/null
fi


if $helper ; then
  (cd ${dir} && ./scripts/build-wasm.sh helper ${mode} ${compression} )
  cp ${dir}/bin/wasm/${mode}/${name}-helper.wasm ./dist/${mode}/wasm/${name}-helper.wasm

  if [[ "$*" == *compression* ]]; then
    cp ${dir}/bin/wasm/${mode}/${name}-helper.wasm.gz ./dist/${mode}/wasm/${name}-helper.wasm.gz 2>/dev/null
    cp ${dir}/bin/wasm/${mode}/${name}-helper.wasm.br ./dist/${mode}/wasm/${name}-helper.wasm.br 2>/dev/null
  fi
fi

if [[ "$*" == *webpack* ]]; then
    npm run build-webworker-wasm ${compressionWebpack} -- --mode=production
    npm run build-ui ${compressionWebpack} -- --mode=production
fi