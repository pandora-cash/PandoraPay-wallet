import Vue from 'vue';

export default {

    setChatConversationsCount(context, { publicKey, count } ){

        const conversations = { ...( context.conversations[ publicKey ] || {} )  };

        conversations.count = count;

        Vue.set(context.conversations, publicKey, conversations );

    },

    setChatConversations(context, { publicKey, array } ){

        const conversations = { ...( context.conversations[ publicKey ] || {} )  };
        if (!conversations.array) conversations.array = {};

        for (const element of array) {
            element.count = Number.parseInt(element.count);
            conversations.array[element.receiverPublicKey] = element;
        }

        Vue.set(context.conversations, publicKey, conversations );

    },


    setChatConversationMessagesCount(context, { publicKey1, publicKey2, count } ){

        const publicKeys = [publicKey1, publicKey2].sort( (a,b) => a.localeCompare(b) );

        const conversationMessages = { ...( context.conversationMessages[ publicKeys[0]+":"+publicKeys[1] ] || {} )  };

        conversationMessages.count = count;

        Vue.set(context.conversationMessages, publicKeys[0]+":"+publicKeys[1], conversationMessages );

    },

    setChatConversationMessagesIds(context, { publicKey1, publicKey2, ids, next } ){

        const publicKeys = [publicKey1, publicKey2].sort( (a,b) => a.localeCompare(b) );

        const conversationMessages = { ...( context.conversationMessages[ publicKeys[0]+":"+publicKeys[1] ] || {} )  };
        if (!conversationMessages.ids) conversationMessages.ids = {};

        for (const id of ids)
            conversationMessages.ids[id] = true;

        if (next !== undefined)
            conversationMessages.next = next;

        Vue.set(context.conversationMessages, publicKeys[0]+":"+publicKeys[1], conversationMessages );

    },

    async setChatEncryptedMessage(context, { encryptedMessage, newMessage = false } ){


        const publicKeys = [encryptedMessage.senderPublicKey.toString("hex"), encryptedMessage.receiverPublicKey.toString("hex")].sort( (a,b) => a.localeCompare(b) );

        const conversationMessages = { ...( context.conversationMessages[ publicKeys[0]+":"+publicKeys[1] ] || {} )  };
        if (!conversationMessages.ids) conversationMessages.ids = {};

        const id = encryptedMessage.hash().toString("hex");
        if (!conversationMessages.ids[ id ]){

            conversationMessages.ids[ id ] = true;

            Vue.set(context.conversationMessages, publicKeys[0]+":"+publicKeys[1], conversationMessages );

        }

        //a new conversation
        if (newMessage)
            for (let i=0; i < publicKeys.length; i++) {

                const senderPublicKey = publicKeys[i];
                const receiverPublicKey = i === 0 ? publicKeys[1] : publicKeys[0];

                const conversations = {...( context.conversations[ senderPublicKey ] || {} )};
                if (!conversations.array) conversations.array = {};

                let notFound = false;
                if ( !conversations.array[ receiverPublicKey ] ){
                    conversations.array[ receiverPublicKey ] = {};
                    notFound = true;
                }

                const element = conversations.array[ receiverPublicKey ];

                if (notFound){
                    element.version = 0;
                    element.receiverPublicKey = receiverPublicKey;
                    element.count = 1;
                    element.encryptedMessage = encryptedMessage.hash().toString("hex");

                    if (i === 0)
                        conversations.count = (conversations.count || 0) + 1;

                } else
                if (element.encryptedMessage !== encryptedMessage.hash().toString("hex"))  {
                    element.count += 1;
                    element.encryptedMessage = encryptedMessage.hash().toString("hex");
                }

                if ( encryptedMessage.index === undefined)
                    encryptedMessage.index = element.count -1;

                Vue.set(context.conversations, publicKeys[i], conversations);

            }

        try{

            const senderAddress = await PandoraPay.wallet.manager.getWalletAddressByAddress( encryptedMessage.senderAddress );
            if (senderAddress) {

                const data = await encryptedMessage.decryptData(encryptedMessage.senderEncryptedData, senderAddress.decryptPrivateKey() );

                const senderData = await PandoraPay.cryptography.chatMessageValidator.validateChatMessage(data);
                if (senderData)
                    encryptedMessage._senderData = senderData;
            }

        }catch(err){

        }

        try{

            const receiverAddress = await PandoraPay.wallet.manager.getWalletAddressByAddress( encryptedMessage.receiverAddress );
            if (receiverAddress) {
                const data = await encryptedMessage.decryptData(encryptedMessage.receiverEncryptedData, receiverAddress.decryptPrivateKey() );

                const receiverData = await PandoraPay.cryptography.chatMessageValidator.validateChatMessage(data);
                if (receiverData)
                    encryptedMessage._receiverData = receiverData;
            }

        }catch(err){

        }

        const hash = encryptedMessage.hash().toString("hex");
        Vue.set( context.messages, hash, encryptedMessage );

    },

}