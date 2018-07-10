import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import {CSSTransition} from 'react-transition-group';
import colorsys from 'colorsys';

/*
TODO
    Pulse faster when time is up? Make sound?
    timer settings
    Player names in state
    Style form input
    Fix: firefox icons?
*/

let TIMESTEP = 100;
let DEFAULT_PLAYER_COLORS = [
    "#8B0000", //DarkRed
    "#FF8C00", //DarkOrange
    "#FFD700", //Gold
    "#32CD32", //LimeGreen
    "#8B4513", //SaddleBrown
    "#4169E1", //RoyalBlue
    "#FF1493", //DeepPink
    "#800080"  //Purple
]
let MIN_PLAYER_COUNT = 2;
let MAX_PLAYER_COUNT = 8;


class PlayerTimer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            remainingMs: this.props.maxMs
        }
    }

    calcTextColor(bgColor) {
        const rgb = colorsys.parseCss(bgColor);
        let hsl = colorsys.rgb2Hsl(rgb)
        let lightness = hsl.l;
        if (lightness < 50) {
            lightness = 100;
        } else {
            lightness = 0;
        }
        return colorsys.hsl2Hex({h:0, s:0, l: lightness});
    }

    tick() {
        if (this.props.isPaused) {
            return
        }
        if (!this.props.isActive) {
            return
        }
        const activeRemaining = this.state.remainingMs;
        this.setState({remainingMs:Math.max(0,activeRemaining-TIMESTEP)});
    }

    componentDidMount() {
        this.timerID = setInterval(() => this.tick(), TIMESTEP);
    }

    componentWillUnmount() {
        clearInterval(this.timerID);
    }

    render() {
        const width = this.state.remainingMs / this.props.maxMs * 100;
        const percentage = width+"%";
        const remainingSec = Math.ceil(this.state.remainingMs/1000);
        const backgroundColor=this.props.color;
        let textBoxStyle = {
            backgroundColor:backgroundColor,
            color:this.calcTextColor(backgroundColor),
        }
        if (this.props.isActive && !this.props.isPaused) {
            textBoxStyle.animation="pulse 1s ease-in-out infinite alternate ";
        }
        let containerStyle={};
        if (this.props.isActive) {
            containerStyle={flexGrow:1.5};
        }
        let timerBarStyle = {
            width:percentage,
            transition:"width "+TIMESTEP+"ms linear"
        };

        return (
            <div className="flex-container" style={containerStyle}>
                <div className="timer-bar" style={timerBarStyle}/>
                <CSSTransition
                    in={this.props.isActive}
                    timeout={500}
                    classNames="button-animation"
                >
                    <div className="remaining-time" onClick={this.props.onClick} style={textBoxStyle}>
                        {remainingSec}
                    </div>
                </CSSTransition>
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
            classNames="button-animation"
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

function calcPulseColor(bgColor) {
    const rgb = colorsys.parseCss(bgColor);
    let hsl = colorsys.rgb2Hsl(rgb)
    if (hsl.l < 5) {
        hsl.l += 5;
    } else {
        hsl.l -= 5;
    }
    return colorsys.hsl2Hex(hsl);
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
                    <input type="number" min={MIN_PLAYER_COUNT} max={MAX_PLAYER_COUNT}
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
                color: DEFAULT_PLAYER_COLORS[i]
            });
        }
        this.setActivePlayer(0);
    }

    handleTimerListClick(i) {
        //by default clicking on a player makes her active
        let nextActive = i;
        //unless that player is already active, in which case the next in line becomes active
        if (this.state.activePlayer === i) {
            nextActive = (i+1)%this.state.playerCount;
        }
        this.setActivePlayer(nextActive);
    }

    setActivePlayer(i) {
        this.setState({activePlayer:i});
        this.setActivePlayerPulseColors(i);
    }

    setActivePlayerPulseColors(i) {
        //modify DOM to change css pulse animation colors to match current player color.
        //React cannot modify css @keyframes property using idomatic component 'style' property approach
        const backgroundColor=this.state.playerSettings[i].color;
        let newAnimation = document.createElement('style');
        newAnimation.type = 'text/css';
        newAnimation.id = "pulse-animation";
        let keyframes =
        `@keyframes pulse {
            0% {
                background-color: ${backgroundColor}
            }
            100% {
                background-color: ${calcPulseColor(backgroundColor)}
            }
        }`;
        newAnimation.appendChild(document.createTextNode(keyframes));
        let oldAnimation = document.getElementById("pulse-animation");
        oldAnimation.parentNode.replaceChild(newAnimation, oldAnimation);
    }

    handleSettingsPlayerCount(event){
        let playerCount = parseFloat(event.target.value);
        playerCount = Math.max(playerCount,MIN_PLAYER_COUNT);
        playerCount = Math.min(playerCount,MAX_PLAYER_COUNT);

        let playerSettings = this.state.playerSettings.slice(0, playerCount);
        for (let i = playerSettings.length; i < playerCount; i++) {
            playerSettings.push({
                color: DEFAULT_PLAYER_COLORS[i]
            })
        }

        this.setState({
            playerCount:playerCount,
            playerSettings: playerSettings
        });
        this.setActivePlayer(0);
    }

    handleSettingsColor(i, event) {
        let playerSettings = this.state.playerSettings.slice()
        playerSettings[i].color = event.target.value;
        this.setState({playerSettings:playerSettings})
        if (i===this.state.activePlayer) {
            this.setActivePlayerPulseColors(i);
        }
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

