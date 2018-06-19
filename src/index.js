import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*
TODO
    central play/pause button
    player colors defined in state
    have remainingTimeColorModify Player color
*/

function PlayerTimer(props) {
    const width = props.remainingMs / props.maxMs * 100;
    const percentage = width+"%";
    const remainingSec = Math.ceil(props.remainingMs/1000);
    let remainingTimeColor={};
    if (props.isActive) {
        remainingTimeColor={backgroundColor:"yellow"}
    }
    return (
        <div className="flex-container">
            <div className="timer-bar" style={{width:percentage}}/>
            <div className="remaining-time" onClick={props.onClick} style={remainingTimeColor}>{remainingSec}</div>
        </div>
    );
}

class TimerList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //fill().map() syntax required to fill with unique object instances
            timers:Array(this.props.playerCount).fill().map(u => ({
                remainingMs:10000,
                maxMs:10000
            })),
            activeTimer:null,
        }
    }

    tick() {
        const activeTimer = this.state.activeTimer;
        if (activeTimer==null) {
            return
        }
        let timers = this.state.timers.slice();
        const activeRemaining = timers[activeTimer].remainingMs;
        timers[activeTimer].remainingMs = Math.max(0,activeRemaining-50);
        this.setState({timers:timers});
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), 50);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    handleClick(i) {
        //by default clicking on a player makes her active
        let nextActive = i;
        //unless that player is already active, in which case the next in line becomes active
        if (this.state.activeTimer === i) {
            nextActive = (i+1)%this.props.playerCount;
        }
        this.setState({activeTimer:nextActive});
    }

    render() {
        let timers = [];
        for (let i = 0; i < this.props.playerCount; i++) {
            let isActive=false;
            if (this.state.activeTimer===i) {
                isActive=true;
            }
            timers.push(
                (<PlayerTimer
                    onClick={() => this.handleClick(i)}
                    maxMs={this.state.timers[i].maxMs}
                    remainingMs={this.state.timers[i].remainingMs}
                    isActive={isActive}
                />));
        }
        return <div className="flex-container">{timers}</div>;
    }
}

class App extends React.Component {
    render() {
        return <TimerList playerCount={3}/>;
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

