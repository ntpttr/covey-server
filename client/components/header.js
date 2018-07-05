import React from 'react';

export default class extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="header clearfix">
                <div className="logo">
                    ☻
                </div>
                <div className="navigation">
                    <h3>Home</h3>
                    <h3>About</h3>
                    <h3>Groups</h3>
                </div>
                <style jsx>{`
                    .header {
                        background: #3B0030;
                        height: 70px;
                    }
                    .logo {
                        float: left;
                        font-size: 36px;
                        color: #FEDD55;
                        padding: 5px;
                        margin-left: 10px;
                    }
                    .navigation {
                        float: right;
                        margin-top: 20px;
                        align: center;
                        width: 150px;
                    }
                    h3 {
                        padding: 5px;
                    }
                `}</style>
            </div>
        )
    }

}
