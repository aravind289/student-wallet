import React from 'react'
import {Link} from 'react-router-dom'
import * as db from '../firebase/Database'

import firebase from '../firebase'

class Home extends React.Component {
    state = {
        count: "Loading",
        users: [],
        phone: null,
        currentUser: null,
        transactions: {},
    }

    componentDidMount = async () => {
        firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            const phone = user.phoneNumber.substr(3)
            this.initStates(phone)
          }
          else
            this.props.history.push('/verify')
        });
    }

    initStates = (phone) => {
        db.fetchUser(phone, (currentUser) => this.setState({
            currentUser
        }))

        db.fetchTransaction(phone, (transactions) => this.setState({
            transactions,
        }))

        this.setState({
            phone,
        })
    }

    render() {
        const {currentUser, transactions} = this.state
        let cash, bank
        if(currentUser){
            cash = currentUser.accounts.cash
            bank = currentUser.accounts[Object.keys(currentUser.accounts)[1]]
        }
        return (
            <div>
                Welcome to student wallet, {currentUser && currentUser.name||"loading"}
                <br /> Your cash balance: {cash?cash:"loading balance"}
                <br /> Your bank balance: {bank?bank.bank_bal:"loading balance"}
                <div className="newTrans">
                <Link to="/new">New Transaction</Link>
                </div>
                <div className="trans">
                    {
                        Object.keys(transactions).map((key, index) => (
                            <div className="trans" key={index}>
                                Transaction id: {key}
                            </div>
                        ))
                    }
                </div>
            </div>
        )
    }
}

export default Home;