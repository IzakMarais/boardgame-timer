import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import {CSSTransition} from 'react-transition-group';

/*
TODO
    player colors defined in state
    have playerColor pulse slowly when active. Pulse faster when time out.
*/

let timeStep = 100;
let defaultPlayerColors = [
    "#ff0000",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#0000ff",
    "#00ff00",
    "#880000",
    "#ff0088"
]

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
        let containerStyle={};
        if (this.props.isActive) {
            containerStyle={flexGrow:1.5};
        }
        let timerBarStyle = {
            width:percentage,
            transition:"width "+timeStep+"ms linear"
        };
        let textBoxStyle = {
            backgroundColor:this.props.color
        }
        return (
            <div className="flex-container" style={containerStyle}>
                <div className="timer-bar" style={timerBarStyle}/>
                    <div className="remaining-time" onClick={this.props.onClick} style={textBoxStyle}>
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
                color={props.playerColors[i]}
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
    let icon = "pause";
    if (props.paused) {
        icon = "play_arrow";
    }
    return (
        <CSSTransition
            in={props.paused}
            timeout={500}
            classNames="pause-animation"
        >
            <div className="pause-button" onClick={props.onClick}>
                <Icon name={icon} size="large"/>
            </div>
        </CSSTransition>
    );
}

function SettingsButton(props) {
    return (
        <div className="settings-button" onClick={props.onClick}>
            <Icon name="settings" size="medium"/>
        </div>
    );
}

function Settings(props) {
    let colorPickers = [];
    for (let i = 0; i < props.playerCount; i++) {
        colorPickers.push((
            <React.Fragment key={i}>
                <label>Player {i+1}:
                    <input type="color"
                        onChange={(e)=>props.onColorChange(i,e)}
                        value={props.playerColors[i]}
                    />
                </label>
                <br />
            </React.Fragment>
        ));
    }

    return (
        <div id="settings" className={props.open ? "slideIn" : "slideOut"}>
            <form id="settings-form"  onSubmit={props.onSubmit}>
                <label> Player Count:
                    <input type="number" min="2" max="8"
                        value={props.playerCount}
                        onChange={props.onPlayerCountChange}
                    />
                </label>
                <br />
                {colorPickers}
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
            playerSettings: [],
            activePlayer:0,
        }
        for (let i = 0; i < this.state.playerCount; i++) {
            this.state.playerSettings.push({
                color: defaultPlayerColors[i]
            });
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

    handleSettingsPlayerCount(event){
        const playerCount = parseFloat(event.target.value);
        let playerSettings = this.state.playerSettings.slice(0, playerCount);
        for (let i = playerSettings.length; i < playerCount; i++) {
            playerSettings.push({
                color: defaultPlayerColors[i]
            })
        }

        this.setState({
            playerCount:playerCount,
            activePlayer:0,
            playerSettings: playerSettings
        });
    }

    handleSettingsColor(i, event) {
        let playerSettings = this.state.playerSettings.slice()
        playerSettings[i].color = event.target.value;
        this.setState({playerSettings:playerSettings})
    }

    handlSettingsSubmit(event){
        event.preventDefault();
        this.setState({isSettingsOpen:false});
    }

    toggleSettings() {
        if (this.state.isSettingsOpen) {
            this.closeSettings();
        } else {
            this.openSettings();
        }
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

    render() {
        const playerColors = this.state.playerSettings.map(s => s.color);
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
                        playerColors={playerColors}
                        isPaused={this.state.isPaused}
                        activePlayer={this.state.activePlayer}
                        handleClick={(i)=>this.handleTimerListClick(i)}
                    />
                </div>
                <Settings
                    open={this.state.isSettingsOpen}
                    playerCount={this.state.playerCount}
                    onPlayerCountChange={(e)=>this.handleSettingsPlayerCount(e)}
                    playerColors={playerColors}
                    onColorChange={(i,e)=>this.handleSettingsColor(i,e)}
                    onSubmit={(e)=>this.handlSettingsSubmit(e)}
                />
            </React.Fragment>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));

