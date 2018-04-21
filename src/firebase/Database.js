import firebase from './'
import {login} from './auth_ui'

const Database = firebase.database()
window.db = Database

export const checkUserExists = (phone, fnSuccess, fnFailure) => {
    // Query for users with the same number
    Database.ref("/users").orderByChild("phone").equalTo(phone).once("value", (snapshot) => {
        // User does not exist
        if(snapshot.val()==null){
            fnFailure()
            return
        }
        // User does exist
        login()
        fnSuccess()
    })  
}

export const fetchUser = (phone, callback) => {
    Database.ref("/users").orderByChild("phone").equalTo(phone).on("child_added", (data) => {
        // User does not exist
        const user = data.val()
        console.log(user)
        if(user==null){
            return null
        }
        callback(user)
    })   
}
window.db = Database

export const fetchTransaction = (phone, callback) => {
    Database.ref("/transactions").orderByChild("user").equalTo(parseInt(phone, 10)).on("value", (snapshot) => {
        // trans does not exist
        const trans = snapshot.val()
        console.log(trans)
        if(trans==null){
            return null
        }
        callback(trans)
    })  
}

export const createTransaction = (transaction, fnSuccess) => {
    console.log(transaction)
    const newTrans = Database.ref("/transactions").push()
    newTrans.set({
        ...transaction,
    })
    fetchUser(transaction.user.toString(), updateUser(transaction))
    fnSuccess()
}

export const updateUser = (transaction) => (user) => {
    console.log("In update func: ");
    console.log(transaction);
    if (transaction.type=="withdrawal")
        user.accounts[transaction.cashorbank]-=transaction.amount
    if(transaction.type=="deposit"){
        user.accounts[transaction.cashorbank]+=transaction.amount
    }

    const userKey = localStorage.getItem("student_wallet_user_key")
    Database.ref().child(`/users/${userKey}`).update({
        ...user
    })
}

export const registerUser = (user, accounts, callback) => {

    // Query for users with the same number
    Database.ref("/users").orderByChild("phone").equalTo(user.phone).on("value", (snapshot) => {

        // Only add a new user if the previous user doesn't exist
        if(snapshot.val()==null){
            const newUserRef = Database.ref("/users").push()
            localStorage.setItem("student_wallet_user_key", newUserRef.key)
            newUserRef.set({
                ...user,
                accounts,
            })
            // User creation successfull
            login()
            callback(true)
            return
        }
        // User creation failed
        callback(false)
    })
}

export default Database
