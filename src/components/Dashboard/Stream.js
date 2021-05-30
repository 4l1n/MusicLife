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
import axios from 'axios'
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import firebase from "../firebase";
import {Button, Input, InputLabel} from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from '@material-ui/lab/Alert';
import {Formik} from "formik";
import { Doughnut } from 'react-chartjs-2';

const styles = theme => ({
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
    },
    root: {
        display: 'flex',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
    },
    content: {
        flex: '1 0 auto',
    },
    cover: {
        width: 151,
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        padding: 16
    },
    playIcon: {
        height: 38,
        width: 38,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
    input: {
        width: '100%'
    }
});

const moodStates = {
    angry: {
        name: 'Angry',
        src: Angry,
        keywords: ['Duality Slipknot', 'I Hate Everything About You Three Days Grace', 'Bodies Drowning Pool', 'Killing In The Name Rage Against The Machine']
    },
    disgusted: {
        name: 'Disgusted',
        src: Disgusted,
        keywords: ['Knock tha Hustle', 'Demons n distractions', 'freaky 45', 'nothing']
    },
    fearful: {
        name: 'Fearful',
        src: Fearful,
        keywords: ['not afraid', 'control', 'enter sandman', 'paranoid']
    },
    happy: {
        name: 'Happy',
        src: Happy,
        keywords: ['frontin', 'maroon5', 'freedom', 'come and get id bae']
    },
    neutral: {
        name: 'Neutral',
        src: Neutral,
        keywords: ['imagine dragons', 'undertale', 'linkin park', 'lil peep']
    },
    sad: {
        name: 'Sad',
        src: Sad,
        keywords: ['beret', 'llegarà', 'pablo alboran', 'dos hombres y un mismo destino']
    },
    surprised: {
        name: 'Surprised',
        src: Surprised,
        keywords: ['lamo', 'lalalala', 'bajo el agua manuel medrano', 'diamons']
    }
}

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Stream = (prop) => {
    const {classes, user} = prop;

    const [posts, setPosts] = useState([])
    const [foundexp, setfoundexp] = useState('neutral');
    const [open, setOpen] = useState(false);
    const [metrics, setMetrics] = useState([]);
    const [newName, setNewName] = useState(user && user.username);
    const [gender, setGender] = useState(user && user.gender);

    useEffect(() => {
        const onSaveSong = async() => {
            try {
                await firebase.saveSong(posts[0].id.videoId, posts[0].snippet.title, posts[0].snippet.description, posts[0].snippet.thumbnails.default.url)
            } catch(error) {
                alert(error.message)
            }
        }

        const onSaveMetrics = async() => {
            try {
                await firebase.saveMetrics(posts[0].id.videoId, posts[0].snippet.title, foundexp, Date.now());
            } catch (error) {
                alert(error.message)
            }
        }

        if (posts.length > 0) {
            onSaveSong().then();
            onSaveMetrics().then();
        }
    }, [posts]);

    useEffect(() => {
        if (foundexp) {
            firebase.getMetrics().then(setMetrics);
        }
    }, [foundexp]);

    useEffect(() => {
        const random = Math.floor(Math.random() * moodStates[foundexp].keywords.length)

        axios({
            "method": "GET",
            "url": 'https://www.googleapis.com/youtube/v3/search',
            "params":{
                'part':'snippet',
                'maxResults':'1',
                'key':'AIzaSyB2G1P8UDUUgC4-c6czDMMpEyavuM-O9Fs',
                'q':foundexp + moodStates[foundexp].keywords[random] + ' song'
            }
        })
            .then((res) => {
                setPosts(res.data.items)
            })
            .catch((error) => {
                console.log(error)
            })
    },[foundexp]);

    useEffect(() => {
        Webcam();
    }, []);

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

            }, 10000);
        })
    }


    const getMetrics = () => {
        if (metrics) {
            const array = [0, 0, 0, 0, 0, 0, 0];

            metrics.map(m => {
                switch (m.expresion) {
                    case 'angry':
                        array[0] += 1;
                        break;

                    case 'disgusted':
                        array[1] += 1;
                        break;

                    case 'fearful':
                        array[2] += 1;
                        break;

                    case 'happy':
                        array[3] += 1;
                        break;

                    case 'neutral':
                        array[4] += 1;
                        break;

                    case 'sad':
                        array[5] += 1;
                        break;

                    case 'surprised':
                        array[6] += 1;
                        break;
                }
            })


            return array;
        }
    }
    console.log(metrics);
    const data = {
        labels: ['Angry', 'Disgusted', 'Fearful', 'Happy', 'Neutral', 'Sad', 'Surprised'],
        datasets: [{
            label: 'My First Dataset',
            data: getMetrics(),
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)',
                'rgb(156,255,86)',
                'rgb(122,121,118)',
                'rgb(29,29,29)',
                'rgb(248,53,92)',
            ],
            hoverOffset: 4
        }]
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <div style={{width: '100%'}}>
            <div style={{display: 'flex'}}>
                <Avatar alt="MoodState" src={moodStates[foundexp] !== undefined ? moodStates[foundexp].src : Neutral} className={classes.avatar} />
            </div>
            <div style={{width: '100%'}}>
                <div style={{textAlign: 'center'}}>
                    <h1>{moodStates[foundexp] !== undefined ? moodStates[foundexp].name : 'Detecting...'}</h1>

                    <Typography component="h1" variant="h5">
                        Hello { newName + ', ' + gender }
                    </Typography>
                </div>

                <Accordion style={{marginTop: 16, marginBottom: 16, width: '100%'}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography className={classes.heading}>Account settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>

                        <Formik
                            initialValues={{ name: user && user.username, gender: user && user.gender}}
                            enableReinitialize={true}
                            validate={values => {
                                const errors = {};

                                if (!values.name) {
                                    errors.name = 'Name is required'
                                }

                                if (!values.gender) {
                                    errors.gender = 'Gender is required';
                                }

                                return errors;
                            }}
                            onSubmit={(values, { setSubmitting }) => {
                                setTimeout(() => {
                                    setNameGender(values.name, values.gender)
                                        .then(() => {
                                            setNewName(values.name);
                                            setGender(values.gender);
                                        })
                                        .finally(() => setSubmitting(false));
                                }, 400);
                            }}
                        >
                            {({
                                  values,
                                  errors,
                                  touched,
                                  handleChange,
                                  handleSubmit,
                                  isSubmitting,
                              }) => (
                                <form onSubmit={handleSubmit} style={{width: '100%'}}>
                                    <Input name="name" placeholder={'name'} autoComplete="off" type={'text'} value={values.name} onChange={handleChange} className={classes.input} />
                                    <Typography color={'error'}>
                                        {errors.name && touched.name && errors.name}
                                    </Typography>

                                    <InputLabel id="demo-simple-select-label" style={{marginTop: 16}}>Gender</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        name={'gender'}
                                        placeholder={'Gender'}
                                        value={values.gender}
                                        className={classes.input}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value={'male'}>Male</MenuItem>
                                        <MenuItem value={'female'}>Female</MenuItem>
                                    </Select>

                                    <Typography color={'error'}>
                                        {errors.gender && touched.gender && errors.gender}
                                    </Typography>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        disabled={isSubmitting}
                                        className={classes.submit}>
                                        Save changes
                                    </Button>
                                </form>
                            )}
                        </Formik>

                        <div>
                            <Doughnut data={data} width={300} height={300} />
                        </div>

                        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
                            <Alert onClose={handleClose} severity="success">
                                Changes saved!
                            </Alert>
                        </Snackbar>
                    </AccordionDetails>
                </Accordion>


                <div style={{textAlign: 'center'}}>
                    <Typography component="h1" variant="h5">
                        Song recommended:
                    </Typography>
                </div>
            </div>

            <canvas id="canvas" className={classes.video} />
            <video id="video" width="100%" height="auto" autoPlay muted className={classes.video} />

            {posts.length > 0 && (
                posts.map(item => {
                    return (
                        <Card className={classes.root} key={item.id}>
                            <div className={classes.details}>
                                <CardContent className={classes.content}>
                                    <Typography component="h5" variant="h5">
                                        {item.snippet.title}
                                    </Typography>
                                    <Typography variant="subtitle1" color="textSecondary">
                                        {item.snippet.description}
                                    </Typography>
                                </CardContent>
                                <div className={classes.controls}>
                                    <IconButton aria-label="previous">
                                        {false ? <SkipNextIcon /> : <SkipPreviousIcon />}
                                    </IconButton>
                                    <IconButton aria-label="play/pause">
                                        <a href={'https://www.youtube.com/watch?v=' + item.id.videoId}>
                                            <PlayArrowIcon className={classes.playIcon} />
                                        </a>
                                    </IconButton>
                                    <IconButton aria-label="next">
                                        {false ? <SkipPreviousIcon /> : <SkipNextIcon />}
                                    </IconButton>
                                </div>
                            </div>
                            <img
                                className={classes.cover}
                                src={item.snippet.thumbnails.default.url}
                                title="Live from space album cover"
                            />
                        </Card>
                    )
                })
            )}
        </div>
    )

    async function setNameGender(name, gender) {
        try {
            await firebase.setNameGender(name, gender).then(() => setOpen(true));
        } catch(error) {
            alert(error.message)
        }
    }
}

export default withStyles(styles)(Stream);