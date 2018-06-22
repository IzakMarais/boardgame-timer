import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*
TODO
    player colors defined in state
    have playerColor pulse slowly when active. Pulse faster when time out.
        https://css-tricks.com/almanac/properties/a/animation/
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
        if (this.props.isPaused) {
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
                    key={i}
                />));
        }
        return <div className="flex-container">{timers}</div>;
    }
}

function PauseButton(props) {
    let icon = "▌▌";
    if (props.paused) {
        icon = "▶";
    }
    return <div className="pause-button" onClick={props.onClick}>{icon}</div>;
}

function SettingsButton(props) {
    return <div className="settings-button" onClick={props.onClick}>⚙</div>;
}

function Settings(props) {
    return (
        <div className="flex-container">
            <form className="settings" onSubmit={props.onSubmit}>
                <label> Player Count:
                    <input type="number" min="2" max="8" value={props.playerCount} onChange={props.onPlayerCountChange}/>
                </label>
                <br />
                <input type="submit" value="OK"/>
            </form>
        </div>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPaused:false,
            isSettingsOpen:true,
            playerCount: 4,
        }
    }

    handlePlayerCount(event){
        this.setState({playerCount:parseFloat(event.target.value)});
    }

    handlSettings(event){
        event.preventDefault();
        this.setState({isSettingsOpen:false});
    }

    togglePaused() {
        this.setState({isPaused:!this.state.isPaused})
    }

    toggleSettings() {
        this.setState({isSettingsOpen:!this.state.isSettingsOpen})
    }

    renderTimerOrSettings() {
        if (this.state.isSettingsOpen) {
            return (
                <Settings
                    playerCount={this.state.playerCount}
                    onPlayerCountChange={(e)=>this.handlePlayerCount(e)}
                    onSubmit={(e)=>this.handlSettings(e)}
                />
            );
        }
        return (
            <TimerList
                playerCount={this.state.playerCount}
                isPaused={this.state.isPaused}
            />
        );
    }

    render() {
        return (
            <div className="app">
                <div className="sidebar">
                    <SettingsButton onClick={()=>this.toggleSettings()}/>
                    <PauseButton
                        onClick={()=>this.togglePaused()}
                        paused={this.state.isPaused}
                    />
                </div>
                {this.renderTimerOrSettings()}
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

