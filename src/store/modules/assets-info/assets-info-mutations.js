import Vue from "vue";

export default {

    setAssetInfo(context, assetInfo ){
        Vue.set(context.list, assetInfo.hash, assetInfo)
    },

    setAssetsInfo(state, listByHeights ){
        state.listByHeight = listByHeights
    },

}
