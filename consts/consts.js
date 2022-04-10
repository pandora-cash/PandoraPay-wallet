export default {

    name: "pandora cash",
    title: 'pandora cash',
    entity: 'pandora cash',
    website: 'https://pandorapay.org/',

    assetsInfoPagination: 10,
    blocksInfoPagination: 10,
    addressTxsPagination: 10,
    mempoolTxsPagination: 50,

    goArgv: [
        'js',
        '--network=mainet',
        '--consensus=wallet',
        '--tcp-max-clients=1'
    ],

}
