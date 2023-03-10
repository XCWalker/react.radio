import { Fragment, useCallback, useEffect } from "react";
import { useState } from "react"
import { Helmet } from "react-helmet";

import "../style/pages/player.css"
import "../style/pages/history.css"
import "../style/pages/timetable.css"
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

const apiUrl = "https://apiv2.simulatorradio.com/metadata/combined"
const apiHistoryUrl = "https://apiv2.simulatorradio.com/metadata/history?limit="
const apiTimetableUrl = "https://apiv2.simulatorradio.com/timetable?day="
const audioUrl = "https://simulatorradio.stream/320"

export function Player() {
    const [dj, setDJ] = useState();
    const [nowPlaying, setNowPlaying] = useState();
    const [ticking, setTicking] = useState(true);
    const [count, setCount] = useState(0);
    const [audioUrlState, setAudioUrlState] = useState("");
    const [state, setState] = useState("paused");
    const [volume, setVolume] = useState(100);

    useEffect(() => {
        fetch(apiUrl)
            .then(
                (data) => {
                    data.json().then(res => {
                        setNowPlaying(res.now_playing)
                        setDJ(res.djs.now)
                    })
                },
                (error) => {
                    console.error(error);
                }
            )
    }, [count])

    useEffect(() => {
        const timer = setTimeout(() => ticking && setCount(count + 1), 3000)
        return () => clearTimeout(timer)
    }, [count, ticking])

    function stop() {
        if (audioUrlState === "") {
            setAudioUrlState(audioUrl);
            setState("play");
            return
        } else {
            setAudioUrlState("");
            setState("paused");
            return
        }
    }

    const playPause = useCallback(() => {
        var player = document.querySelector("#audioPlayer")

        if (audioUrlState === "") {
            setAudioUrlState(audioUrl);
        }

        if (state === "paused") {
            setState("play")
            player.play();
            return
        } else if (state === "play") {
            setState("paused")
            player.pause();
            return
        }
    }, [audioUrlState, state])

    async function live() {
        var player = document.querySelector("#audioPlayer")

        if (audioUrlState === "") {
            setAudioUrlState(audioUrl);
        }

        setState("play")
        await player.load();
        player.play();
    }

    function rewind() {
        var player = document.querySelector("#audioPlayer")

        player.currentTime = player.currentTime - 10;
    }

    function fastForward() {
        var player = document.querySelector("#audioPlayer")
        var newTime = player.currentTime + 30;

        if (newTime < player.duration + 5) {
            player.currentTime = newTime;
        }
    }

    function volumeChange(e) {
        var player = document.querySelector("#audioPlayer")
        setVolume(e.target.value)
        player.volume = e.target.value / 100;
    }

    useEffect(() => {
        if (nowPlaying === undefined || nowPlaying === null || audioUrlState === "" || navigator.mediaSession.metadata?.title === nowPlaying.title) return

        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: nowPlaying.title,
                artist: nowPlaying.artists,
                album: "ReactRadio",
                artwork: [{ src: nowPlaying.art }],
            });

            navigator.mediaSession.setActionHandler('play', () => {
                console.log("play")
                
                setState("play")
                document.querySelector("#audioPlayer").play()
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                console.log("pause")
                
                setState("paused")
                document.querySelector("#audioPlayer").pause()
            });
        }
    }, [nowPlaying, playPause, audioUrlState])

    return <>
        <Helmet>
            {state === "paused" && audioUrlState === "" && <title>{'ReactRadio'}</title>}
            {state === "paused" && audioUrlState !== "" && <title>{nowPlaying?.title + ' - ' + nowPlaying?.artists + ' | ReactRadio'}</title>}
            {state === "play" && audioUrlState !== "" && <title>{nowPlaying?.title + ' - ' + nowPlaying?.artists + ' | ReactRadio'}</title>}
        </Helmet>
        <section id="player" onLoad={() => { setTicking(true) }}>
            <div className="dj">
                {dj?.avatar && <img src={"https://simulatorradio.com/processor/avatar?size=256&name=" + dj?.avatar} alt="" className="profilePicture" />}
                <div className="about">
                    <span className="title">{dj?.displayname}</span>
                    <ReactMarkdown className="subTitle">{dj?.details}</ReactMarkdown>
                </div>
            </div>
            <div className="container">
                <div className="player">
                    <div className="art" onClick={() => { stop() }}>
                        <img src={nowPlaying?.art} alt="" />

                        <svg
                            viewBox="0 0 135.47 135.47"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g fill="#fff">
                                <path d="M34.901 29.575V46.58h63.82c4.505 0 7.848.98 10.029 2.942 2.252 1.963 3.379 4.725 3.379 8.286 0 3.488-1.127 6.213-3.38 8.175-2.18 1.962-5.523 2.944-10.029 2.944H34.901v16.679h63.61l13.835 20.276h23.11l-16.468-23.997c4.617-2.221 8.217-5.268 10.8-9.142 2.761-4.216 4.142-9.194 4.142-14.935 0-5.814-1.38-10.83-4.142-15.045-2.762-4.287-6.686-7.558-11.774-9.81-5.014-2.253-11.01-3.38-17.987-3.38z" />
                                <path d="M0 29.575v17.007h33.575c4.506 0 7.85.98 10.03 2.942 2.252 1.963 3.379 4.725 3.379 8.286 0 3.488-1.127 6.214-3.38 8.176-2.18 1.962-5.523 2.943-10.029 2.943H0v16.68h33.368l13.835 20.276h23.11L53.846 81.888c4.617-2.221 8.217-5.268 10.8-9.142 2.761-4.216 4.142-9.194 4.142-14.935 0-5.814-1.38-10.83-4.142-15.044-2.762-4.288-6.687-7.558-11.774-9.811-5.015-2.253-11.01-3.38-17.987-3.38z" />
                            </g>
                        </svg>

                        {state === "paused" && <button className="material-symbols-outlined large" onClick={() => { playPause() }} title="Play">play_arrow</button>}
                        {state === "play" && <button className="material-symbols-outlined large" onClick={() => { playPause() }} title="Pause">pause</button>}
                    </div>
                    <div className="info">
                        <span className="title">{nowPlaying?.title}</span>
                        <span className="subTitle">{nowPlaying?.artists}</span>
                    </div>
                </div>
                <div className="controls">
                    <div className="left">
                        {document.querySelector("#audioPlayer")?.currentTime + 7.5 > document.querySelector("#audioPlayer")?.duration && <span className="live">Live</span>}
                    </div>
                    <div className="info">
                        <span className="title">{nowPlaying?.title}</span>
                        <span className="subTitle">{nowPlaying?.artists}</span>
                    </div>
                    <div className="center">
                        <button className="material-symbols-outlined" onClick={() => { rewind() }} disabled={document.querySelector("#audioPlayer")?.currentTime < 10} title="Rewind 10s">replay_10</button>
                        <button className="material-symbols-outlined" onClick={() => { live() }} title="Live">stream</button>

                        {state === "paused" && <button className="material-symbols-outlined large" onClick={() => { playPause() }} title="Play">play_circle</button>}
                        {state === "play" && <button className="material-symbols-outlined large" onClick={() => { playPause() }} title="Pause">pause_circle</button>}

                        <button className="material-symbols-outlined" onClick={() => { stop() }} title="Stop">stop_circle</button>
                        <button className="material-symbols-outlined" onClick={() => { fastForward() }} disabled={document.querySelector("#audioPlayer")?.currentTime + 30 > document.querySelector("#audioPlayer")?.duration + 5} title="FastForward 30s">forward_30</button>
                    </div>
                    <div className="right">
                        <input type="range" min="0" max="100" value={volume} className="slider" id="volume" onChange={(e) => { volumeChange(e) }} />
                    </div>
                </div>
            </div>
            {/* <div className="mobile"></div> */}
            <img src={nowPlaying?.art} alt="" className="background" />
        </section>
        <audio src={audioUrlState} id="audioPlayer" autoPlay="autoplay" crossOrigin="anonymous" />
        <History />
        <Timetable />
    </>
}

function History() {
    const [history, setHistory] = useState();
    const [ticking, setTicking] = useState(true);
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetch(apiHistoryUrl + "7")
            .then(
                (data) => {
                    data.json().then(res => {
                        setHistory(res)
                    })
                },
                (error) => {
                    console.error(error);
                }
            )
    }, [count])

    useEffect(() => {
        const timer = setTimeout(() => ticking && setCount(count + 1), 3000)
        return () => clearTimeout(timer)
    }, [count, ticking])

    return <>
        <section id="history">
            <div className="container">
                <h2>History</h2>
                <ul>
                    {history && history.map((item, index) => {
                        if (index === 0) {
                            return <Fragment key={index} />
                        }
                        return <li key={index}>
                            <img src={item.art} alt="" />
                            <div className="info">
                                <span className="subTitle">{item.artists}</span>
                                <span className="title">{item.title}</span>
                            </div>
                        </li>
                    })}
                </ul>
            </div>
        </section>
    </>
}

function Timetable() {
    const [displayDate, setDisplayDate] = useState(new Date());
    const [timetable, setTimetable] = useState();
    const [ticking, setTicking] = useState(true);
    const [count, setCount] = useState(0);
    const [dayIndex, setDayIndex] = useState(0);

    useEffect(() => {
        fetch(apiTimetableUrl + dayIndex)
            .then(
                (data) => {
                    data.json().then(res => {
                        setTimetable(res.slots)
                    })
                },
                (error) => {
                    console.error(error);
                }
            )
    }, [count, dayIndex])

    useEffect(() => {
        const timer = setTimeout(() => ticking && setCount(count + 1), 20000)
        return () => clearTimeout(timer)
    }, [count, ticking])

    function addDay() {
        setDisplayDate(new Date(displayDate.setDate(displayDate.getDate() + 1)))
        setDayIndex(dayIndex + 1);
    }

    function removeDay() {
        setDisplayDate(new Date(displayDate.setDate(displayDate.getDate() - 1)))
        setDayIndex(dayIndex - 1);
    }

    return <section id="timetable">
        <div className="container">
            <h2>Timetable</h2>
            <div className="inline">
                <button onClick={() => { removeDay() }} className="material-symbols-outlined">remove</button>
                <h3>{displayDate.toLocaleDateString("en-gb", { weekday: 'long' })} {displayDate.getDate()} {displayDate.toLocaleDateString("en-gb", { month: 'long' })} {displayDate.getFullYear()}</h3>
                <button onClick={() => { addDay() }} className="material-symbols-outlined" >add</button>
            </div>
            <ul>
                {timetable && timetable.map((slot, index) => {
                    return <Fragment key={index}>
                        <TimetableItem slot={slot} />
                    </Fragment>
                })}
            </ul>
        </div>
    </section>
}

function TimetableItem(props) {
    const [date, setDate] = useState();

    function addZero(i) {
        if (i < 10) { i = "0" + i }
        return i;
    }

    useEffect(() => {
        if (!props.slot.slotstamp) return

        setDate(new Date(props.slot.slotstamp * 1000))
    }, [props.slot])

    return <li>
        <img src={"https://simulatorradio.com/processor/avatar?size=256&name=" + props.slot.dj.avatar} alt="" />
        <div className="info">
            <div className="inline">
                <span className="title">{props.slot.dj.display_name}</span>
                {date && <span className="date">{addZero(date.getHours())}:{addZero(date.getMinutes())} - {addZero(date.getHours() + 1)}:{addZero(date.getMinutes())}</span>}
            </div>
            <ReactMarkdown className="subTitle">{props.slot.details.toString()}</ReactMarkdown>
        </div>
    </li>
}