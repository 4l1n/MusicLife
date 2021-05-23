import React, { useEffect, useState } from "react"
import * as faceapi from 'face-api.js';
import withStyles from "@material-ui/core/es/styles/withStyles";
import Angry from '../../assets/angry.png';
import Disgusted from '../../assets/disgusted.png';
import Fearful from '../../assets/fearful.png';
import Happy from '../../assets/happy.png';
import Neutral from '../../assets/neutral.png';
import Sad from '../../assets/sad.png';
import Surprised from '../../assets/surprised.png';
import Avatar from "@material-ui/core/Avatar";


const styles = {
    canvas: {
        width: '100%'
    },
    video: {
        position: 'fixed',
        opacity: 0,
        visibility: 'hidden'
    },
    avatar: {
        width: 100,
        height: 100,
        margin: '0 auto'
    }
};

const moodStates = {
    angry: {
        name: 'Angry',
        src: Angry
    },
    disgusted: {
        name: 'Disgusted',
        src: Disgusted
    },
    fearful: {
        name: 'Fearful',
        src: Fearful
    },
    happy: {
        name: 'Happy',
        src: Happy
    },
    neutral: {
        name: 'Neutral',
        src: Neutral
    },
    sad: {
        name: 'Sad',
        src: Sad
    },
    surprised: {
        name: 'Surprised',
        src: Surprised
    }
}

const Stream = (prop) => {
    const {classes} = prop;

    useEffect(() => {
        Webcam();
    }, []);
    const [foundexp, setfoundexp] = useState('neutral');
    const Webcam = async() => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
            faceapi.nets.faceExpressionNet.loadFromUri('./models'),
        ]).then(startVideo)
        const video = document.getElementById('video')
        function startVideo() {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
            if (navigator.getUserMedia) {
                navigator.getUserMedia(
                    { video: {} },
                    stream => video.srcObject = stream,
                    err => console.error(err)
                )
            }
        }

        video.addEventListener('play', () => {
            const canvas = document.getElementById('canvas')
            const displaySize = { width: video.videoWidth, height: video.videoHeight }
            faceapi.matchDimensions(canvas, displaySize)

            setInterval(async () => {
                const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
                if (detections) {

                    const expression = (detections.expressions)
                    const values = Object.values(expression)
                    const exp_inx = values.indexOf(Math.max.apply(Math, values))
                    const exp = Object.getOwnPropertyNames(expression)[exp_inx]
                    setfoundexp(exp)
                }

            }, 1000 / 10)
        })

    }

    return (
        <div>
            <div style={{display: 'flex'}}>
                <Avatar alt="MoodState" src={moodStates[foundexp] !== undefined ? moodStates[foundexp].src : Neutral} className={classes.avatar} />
            </div>
            <div style={{textAlign: 'center'}}>
                <h1>{moodStates[foundexp] !== undefined ? moodStates[foundexp].name : 'Detecting...'}</h1>
            </div>
            <canvas id="canvas" className={classes.video} />
            <video id="video" width="100%" height="auto" autoPlay muted className={classes.video} />
        </div>
    )
}

export default withStyles(styles)(Stream);