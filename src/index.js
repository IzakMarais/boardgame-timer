import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*
TODO
   player colors defined in state
    have playerColor pulse slowly when active. Pulse faster when time out.
*/

let timeStep = 100;

class PlayerTimer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remainingMs: this.props.maxMs
        }
    }

    tick() {
        if (this.props.isPaused) {
            return
        }
        if (!this.props.isActive) {
            return
        }
        const activeRemaining = this.state.remainingMs;
        this.setState({remainingMs:Math.max(0,activeRemaining-timeStep)});
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), timeStep);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        const width = this.state.remainingMs / this.props.maxMs * 100;
        const percentage = width+"%";
        const remainingSec = Math.ceil(this.state.remainingMs/1000);
        let activeStyle={};
        if (this.props.isActive) {
            activeStyle={flexGrow:1.5};
        }
        let timerBarStyle = {
            width:percentage,
            transition:"width "+timeStep+"ms linear"
        };
        return (
            <div className="flex-container" style={activeStyle}>
                <div className="timer-bar" style={timerBarStyle}/>
                    <div className="remaining-time" onClick={this.props.onClick}>
                        {remainingSec}
                    </div>
            </div>
        );
    }
}

function TimerList(props) {
    let timers = [];
    for (let i = 0; i < props.playerCount; i++) {
        let isActive=false;
        if (props.activePlayer===i) {
            isActive=true;
        }
        timers.push(
            (<PlayerTimer
                onClick={() => props.handleClick(i)}
                maxMs={10000}
                isActive={isActive}
                isPaused={props.isPaused}
                key={i}
            />));
    }
    return <div className="flex-container">{timers}</div>;
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
            activePlayer:0,
        }
    }

    handleTimerListClick(i) {
        //by default clicking on a player makes her active
        let nextActive = i;
        //unless that player is already active, in which case the next in line becomes active
        if (this.state.activePlayer === i) {
            nextActive = (i+1)%this.state.playerCount;
        }
        this.setState({activePlayer:nextActive});
    }

    handlePlayerCount(event){
        this.setState({
            playerCount:parseFloat(event.target.value),
            activePlayer:0
        });
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
                        activePlayer={this.state.activePlayer}
                        handleClick={(i)=>this.handleTimerListClick(i)}
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

