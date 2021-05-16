import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firebase-firestore'

const config = {
	apiKey: "AIzaSyBQUbSmCbR4jJKA9HD2UttIZL542EK6fAE",
	authDomain: "musiclife-56317.firebaseapp.com",
	databaseURL: "https://musiclife-56317-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "musiclife-56317",
	storageBucket: "musiclife-56317.appspot.com",
	measurementId: "G-BYNKLEYZ48"
}

class Firebase {
	constructor() {
		app.initializeApp(config)
		this.auth = app.auth()
		this.db = app.firestore()

	}

	login(email, password) {
		return this.auth.signInWithEmailAndPassword(email, password)
	}

	logout() {
		return this.auth.signOut()
	}
	async register(name, email, password, gender) {
		await this.auth.createUserWithEmailAndPassword(email, password)
			.then((cred) => {
				this.db.collection('usuarios').doc(cred.user.uid).set({
					username: name,
					email: email,
					gender: gender
				})
			});

		return this.auth.currentUser.updateProfile({
			displayName: name
		})
	}

	isInitialized() {
		return new Promise(resolve => {
			this.auth.onAuthStateChanged(resolve)
		})
	}

	getCurrentUsername() {
		return this.auth.currentUser && this.auth.currentUser.displayName
	}

	async getUser() {
		return await this.auth.currentUser && this.db.collection('usuarios').doc(this.auth.currentUser.uid).get().then(data => data.data())
	}
}

export default new Firebase()