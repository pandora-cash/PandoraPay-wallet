const base = require('./webpack-base-config')
const { merge } = require('webpack-merge')
const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const consts = require('../consts/consts')
const {SubresourceIntegrityPlugin} = require("webpack-subresource-integrity");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const webpack = require('webpack');
const fs = require('fs')

const crypto = require('crypto')

function sha256(a){
    return crypto.createHash('sha256').update(a).digest('hex');
}

function sha256file(path){
    if (!fs.existsSync(path)) return sha256("")
    return sha256(fs.readFileSync(path))
}

function getFilesizeInBytes(path) {
    if (!fs.existsSync(path)) return 0
    return fs.statSync(path).size;
}

module.exports = (env, argv) => {

    const isProd = argv.mode === "production"

    return merge( base(env, argv), {

        entry: [
            "./src/main.js",
        ],

        output: {
            filename: "Wallet-User-Interface.js"
        },

        plugins: [
            new HtmlWebpackPlugin({
                hash: true,
                title: consts.title,
                description: consts.name,
                template:  path.resolve(__dirname + '/../src/index.hbs'),
                filename: path.resolve(__dirname + `/../dist/${isProd ? 'build' : 'dev'}/index.html`) //relative to root of the application
            }),
            new SubresourceIntegrityPlugin({enabled: isProd }),
            new HtmlWebpackTagsPlugin({
                tags: [ 'static/OverlayScrollbars.min.css', 'static/fonts.css', 'static/theme.css', 'static/fontawesome.min.css'],
                append: true
            }),
            new webpack.DefinePlugin({
                SRI_WEB_WORKER_WASM: isProd ? "'"+sha256file( path.resolve(__dirname + `/../dist/${isProd ? 'build' : 'dev'}/workers/pandora-webworker-wasm.js`) )+"'" : "''",
                SRI_WASM_MAIN: isProd ? "'"+sha256file( path.resolve(__dirname + `/../dist/${isProd ? 'build' : 'dev'}/wasm/pandora-main.wasm`) )+"'" : "''",
                SIZE_WASM_MAIN: `${isProd ? getFilesizeInBytes( path.resolve(__dirname + `/../dist/${isProd ? 'build' : 'dev'}/wasm/pandora-main.wasm`) ) : "0"}`,
                SRI_WASM_HELPER: isProd ? "'"+sha256file( path.resolve(__dirname + `/../dist/${isProd ? 'build' : 'dev'}/wasm/pandora-helper.wasm`) )+"'" : "''",
                SIZE_WASM_HELPER: `${isProd ? getFilesizeInBytes( path.resolve(__dirname + `/../dist/${isProd ? 'build' : 'dev'}/wasm/pandora-helper.wasm`) ) : "0"}`,
            }),
        ],
    });
}
