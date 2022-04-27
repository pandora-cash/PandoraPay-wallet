module.exports = {

    name: "pandora cash",
    title: 'pandora cash',
    entity: 'pandora cash',
    website: 'https://pandoracash.com/',

    assetsInfoPagination: 10,
    blocksInfoPagination: 10,
    addressTxsPagination: 10,
    mempoolTxsPagination: 50,

    goArgv: [
        'js',
        '--network=mainnet',
        '--consensus=wallet',
        '--tcp-max-clients=1'
    ],

}
