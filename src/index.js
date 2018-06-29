import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*
TODO
    * move timer list state up so that it can update when playerCountChanges
    * player colors defined in state
    * have playerColor pulse slowly when active. Pulse faster when time out.
*/

let timeStep = 100;

function PlayerTimer(props) {
    const width = props.remainingMs / props.maxMs * 100;
    const percentage = width+"%";
    const remainingSec = Math.ceil(props.remainingMs/1000);
    let activeStyle={};
    if (props.isActive) {
        activeStyle={flexGrow:1.5};
    }
    let timerBarStyle = {
        width:percentage,
        transition:"width "+timeStep+"ms linear"
    };
    return (
        <div className="flex-container" style={activeStyle}>
            <div className="timer-bar" style={timerBarStyle}/>
                <div className="remaining-time" onClick={props.onClick}>
                    {remainingSec}
                </div>
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
            activeTimer:0,
        }
    }

    tick() {
        const activeTimer = this.state.activeTimer;
        if (this.props.isPaused) {
            return
        }
        let timers = this.state.timers.slice();
        const activeRemaining = timers[activeTimer].remainingMs;
        timers[activeTimer].remainingMs = Math.max(0,activeRemaining-timeStep);
        this.setState({timers:timers});
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), timeStep);
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

function Icon(props) {
    let style={};
    if (props.size==="large") {
        style={fontSize:"48px"};
    }
    if (props.size==="medium") {
        style={fontSize:"36px"};
    }
    if (props.size==="small") {
        style={fontSize:"24px"};
    }
    if (props.size==="tiny") {
        style={fontSize:"18px"};
    }

    return <i className="material-icons" style={style}>{props.name}</i>;
}

function PlayPauseButton(props) {
    let icon = <Icon name="pause_circle_outline" size="large"/>;
    if (props.paused) {
        icon = <Icon name="play_circle_outline" size="large"/>;
    }
    return <div className="pause-button" onClick={props.onClick}>{icon}</div>;
}

function SettingsButton(props) {
    return (
        <div className="settings-button" onClick={props.onClick}>
            <Icon name="settings" size="medium"/>
        </div>
    );
}

function Settings(props) {
    return (
        <div id="settings" className={props.open ? "slideIn" : "slideOut"}>
            <form id="settings-form" onSubmit={props.onSubmit}>
                <label> Player Count:
                    <input type="number" min="2" max="8"
                        value={props.playerCount}
                        onChange={props.onPlayerCountChange}
                    />
                </label>
            </form>
        </div>
    );
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isPaused:true,
            isSettingsOpen:true,
            playerCount: 4,
        }
    }

    handlePlayerCount(event){
        this.setState({playerCount:parseFloat(event.target.value)});
    }

    closeSettings() {
        this.setState({isSettingsOpen:false});
    }

    openSettings() {
        //also Pause when opening settings
        this.setState({isSettingsOpen:true, isPaused: true});
    }

    togglePaused() {
        //can't play while settings is open
        if (this.state.isSettingsOpen) {
            return
        }
        this.setState({isPaused:!this.state.isPaused})
    }

    toggleSettings() {
        if (this.state.isSettingsOpen) {
            this.closeSettings();
        } else {
            this.openSettings();
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className="fillscreen">
                    <div className="sidebar">
                        <SettingsButton onClick={()=>this.toggleSettings()}/>
                        <PlayPauseButton
                            onClick={()=>this.togglePaused()}
                            paused={this.state.isPaused}
                        />
                    </div>
                    <TimerList
                        playerCount={this.state.playerCount}
                        isPaused={this.state.isPaused}
                    />
                </div>
                <Settings
                    open={this.state.isSettingsOpen}
                    playerCount={this.state.playerCount}
                    onPlayerCountChange={(e)=>this.handlePlayerCount(e)}
                />
            </React.Fragment>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

