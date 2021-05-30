import React, { useEffect, useState } from 'react'
import { Typography, Paper, Avatar, CircularProgress, Button } from '@material-ui/core'
import VerifiedUserOutlined from '@material-ui/icons/VerifiedUserOutlined'
import withStyles from '@material-ui/core/styles/withStyles'
import firebase from '../firebase'
import { withRouter } from 'react-router-dom'
import Stream from "./Stream";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";

const styles = theme => ({
	main: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing.unit * 3,
		marginRight: theme.spacing.unit * 3,
		[theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
			width: 1000,
			marginLeft: 'auto',
			marginRight: 'auto',
		},
	},
	paper: {
		marginTop: theme.spacing.unit * 8,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
	},
	avatar: {
		margin: theme.spacing.unit,
		backgroundColor: theme.palette.secondary.main,
	},
	submit: {
		marginTop: theme.spacing.unit * 3,
	},
	root: {
		display: 'flex',
		marginBottom: 16,
		maxWidth: 555,
		marginTop: 16,
		width: '100%'
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
})

function Dashboard(props) {
	const { classes } = props;
	const [user, setUser] = useState(null);
	const [songs, setSongs] = useState([]);

	useEffect(() => {
		firebase.getUser().then(setUser);
		firebase.getSongs().then(setSongs);
	}, []);

	if(!firebase.getCurrentUsername()) {
		props.history.replace('/login');
		return null;
	}

	return (
		<main className={classes.main}>
			<Paper className={classes.paper}>
				<Avatar className={classes.avatar}>
					<VerifiedUserOutlined />
				</Avatar>

				{user && (
					<Stream user={user} />
				)}

				{songs && songs.length > 0 && (
					<div style={{marginTop: 16, marginBottom: 16}}>
						<Typography component="h1" variant="h5" style={{color: '#ff3a89'}}>
							Already recommended
						</Typography>
					</div>
				)}

				{songs.length > 0 && (
					songs.map(item => {
						return (
							<Card className={classes.root} key={item.id}>
								<div className={classes.details}>
									<CardContent className={classes.content}>
										<Typography component="h5" variant="h5">
											{item.title}
										</Typography>
										<Typography variant="subtitle1" color="textSecondary">
											{item.description}
										</Typography>
									</CardContent>
									<div className={classes.controls}>
										<IconButton aria-label="previous">
											{false ? <SkipNextIcon /> : <SkipPreviousIcon />}
										</IconButton>
										<IconButton aria-label="play/pause">
											<a href={'https://www.youtube.com/watch?v=' + item.videoId}>
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
									src={item.thumbnail}
									width={'100%'}
									height={'100%'}
									title="Live from space album cover"
								/>
							</Card>
						)
					})
				)}

				<Button
					type="submit"
					fullWidth
					variant="contained"
					color="secondary"
					onClick={logout}
					className={classes.submit}>
					Logout
          		</Button>
			</Paper>
		</main>
	)

	async function logout() {
		await firebase.logout()
		props.history.push('/')
	}
}

export default withRouter(withStyles(styles)(Dashboard))