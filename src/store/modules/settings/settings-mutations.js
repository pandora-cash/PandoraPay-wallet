export default {



    setDark(state, value ){

        state.dark = value;

        document.getElementsByTagName("html")[0].classList[value ? 'add' : 'remove']('dark');
        localStorage.setItem('dark', value ? 'true' : 'false' )

    },

    setBalanceDecrypterTableSize(state, value){
        state.balanceDecrypterTableSize = Number.parseInt(value)
        localStorage.setItem('balanceDecrypterTableSize', value );
    },

    readLocalStorage(state){
        state.dark = ( localStorage.getItem('dark') || 'false' ) === 'true'
        state.balanceDecrypterTableSize = Number.parseInt( localStorage.getItem('balanceDecrypterTableSize') || '18' )
        state.expert = ( localStorage.getItem('expert') || 'false' ) === 'true'
    },

    setExpert(state, value){
        state.expert = value

        localStorage.setItem('expert', value ? 'true' : 'false' )
    }

}