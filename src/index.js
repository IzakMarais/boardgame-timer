import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class PlayerTimer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remainingMs:5000,
            maxMs:10000,
        }
    }

    tick() {
        let remaining = this.state.remainingMs;
        remaining = Math.max(0,remaining-50);
        this.setState({remainingMs:remaining});
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 50);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        const width = this.state.remainingMs / this.state.maxMs * 100;
        const percentage = width+"%";
        const remainingSec = Math.ceil(this.state.remainingMs/1000);
        return <div style={{width:percentage}}>{remainingSec}</div>;
    }
}

class App extends React.Component {
    render() {
        return (<div className="flex-container">
            <PlayerTimer/>
            <PlayerTimer/>
        </div>);
    }
}
ReactDOM.render(<App />, document.getElementById('root'));

