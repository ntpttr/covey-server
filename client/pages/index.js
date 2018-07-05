import Header from '../components/header';
import Login from '../components/login';
import Register from '../components/register';

import React from 'react';
import Link from 'next/link';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: false,
            registerDisplay: false,
        }

        this.updateLogin = this.updateLogin.bind(this);
        this.displayRegister = this.displayRegister.bind(this);
        this.renderLogin = this.renderLogin.bind(this);
        this.renderHome = this.renderHome.bind(this);
    }

    updateLogin(loggedIn) {
        this.setState({
            loggedIn: loggedIn,
        });
    }

    displayRegister(display) {
        this.setState({
            registerDisplay: display,
        });
    }

    renderLogin() {
        if (!this.state.registerDisplay) {
            return (
                <div className="loginBox">
                    <Login updateLogin={this.updateLogin}/>
                    <button type='button' onClick={() => this.displayRegister(true)}>
                        New User?
                    </button>
                    <style jsx>{`
                        .loginBox {
                            float: right;
                            width: 200px;
                            padding: 20px;
                            margin-right: 20px;
                        }
                        button {
                            background-color: #FF9130;
                            color: white;
                            padding: 15px 30px;
                            margin: 20px;
                            text-align: center;
                            text-decoration: none;
                            display: inline-block;
                            font-size: 10px;
                        }
                    `}</style>
                </div>
            )
        } else {
            return (
                <div>
                    <Register updateLogin={this.updateLogin}/>
                    <button type='button' onClick={() => this.displayRegister(false)}>
                        Back
                    </button>
                </div>
            )
        }
    }

    renderHome() {
        return (
            <div>
                <h3>LOGGED IN</h3>
                <style jsx>{`
                    h3 {
                        font-size: 24px;
                    }
                `}</style>
            </div>
        )
    }

    render() {
        let loginBox;
        if (this.state.loggedIn) {
            loginBox = this.renderHome();
        } else {
            loginBox = this.renderLogin();
        }
        return (
            <div>
                <Header />
                {loginBox}
                <div>
                    <p>kalsjdglajdkgjaiogijoiagjaioj</p>
                </div>
                {/* Global Styles */}
                <style jsx global>{`
                    body {
                        margin: 0px;
                        box-sizing: border-box;
                        background: #128C87;
                    }
                    h3 {
                        font-family: sans-serif;
                        font-size: 11px;
                        font-style: bold;
                        color: #FEDD55;
                        display: inline;
                    }
                    p {
                        color: #FEDD55;
                    }
                    .clearfix::after {
                        content: "";
                        clear: both;
                        display: table;
                    }
                `}</style>
            </div>
        )
    }
}
