import React, { useState } from 'react'
import { Typography, Paper, Avatar, Button, FormControl, Input, InputLabel } from '@material-ui/core'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import withStyles from '@material-ui/core/styles/withStyles'
import { Link, withRouter } from 'react-router-dom'
import firebase from '../firebase'
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {Formik} from "formik";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
const styles = theme => ({
	main: {
		width: 'auto',
		display: 'block', // Fix IE 11 issue.
		marginLeft: theme.spacing.unit * 3,
		marginRight: theme.spacing.unit * 3,
		[theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
			width: 400,
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
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing.unit,
	},
	submit: {
		marginTop: theme.spacing.unit * 3,
	},
	gender: {
		width: '100%'
	},
	input: {
		width: '100%',
		marginTop: 10
	}
})

function Register(props) {
	const { classes } = props

	const [open, setOpen] = React.useState(false);
	const [message, setErrorMessage] = React.useState('');

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}

		setOpen(false);
	};

	return (
		<main className={classes.main}>
			<Paper className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Register Account
       			</Typography>
				<Formik
					initialValues={{ name: '', email: '', password: '', gender: '' }}
					validate={values => {
						const errors = {};

						if (!values.name) {
							errors.name = 'Name is required'
						}

						if (!values.password) {
							errors.password = 'Password is required'
						}

						if (!values.gender) {
							errors.gender = 'Gender is required'
						}

						if (!values.email) {
							errors.email = 'Email is required';
						} else if (
							!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
						) {
							errors.email = 'Invalid email address';
						}

						return errors;
					}}
					onSubmit={(values, { setSubmitting }) => {
						setTimeout(() => {
							onRegister(values.name, values.email, values.password, values.gender)
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
							<Input id="name" name="name" placeholder={'Name'} autoComplete="off" value={values.name} onChange={handleChange} className={classes.input}  />
							<Typography color={'error'}>
								{errors.name && touched.name && errors.name}
							</Typography>

							<Input id="email" name="email" placeholder={'Email'} autoComplete="off" value={values.email} onChange={handleChange} className={classes.input} />
							<Typography color={'error'}>
								{errors.email && touched.email && errors.email}
							</Typography>

							<Input id="password" name="password" placeholder={'Password'} autoComplete="off" type={'password'} value={values.password} onChange={handleChange} className={classes.input} />
							<Typography color={'error'}>
								{errors.password && touched.password && errors.password}
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
								Register
							</Button>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="secondary"
								component={Link}
								to="/login"
								className={classes.submit}>
								Go back to Login
							</Button>
						</form>
					)}
				</Formik>

				<Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
					<Alert onClose={handleClose} severity="error">
						{message}
					</Alert>
				</Snackbar>
			</Paper>
		</main>
	)

	async function onRegister(name, email, password, gender) {
		try {
			await firebase.register(name, email, password, gender);
			props.history.replace('/dashboard');
		} catch(error) {
			setOpen(true);
			setErrorMessage(error.message);
		}
	}
}

export default withRouter(withStyles(styles)(Register))