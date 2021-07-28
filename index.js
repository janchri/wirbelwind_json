	var playlists_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/playlist.json"
	var root_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/root.json"
	var music_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/music.json"
	var www_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/www.json"
	
	const app = Vue.createApp({
		data() {
			return {
				playlists: [],
				tracks : [
					{"path":"/Music/Lieder/track1.mp3","size":1234},
					{"path":"/Music/Lieder/track2.mp3","size":4567},
					{"path":"/Music/Lieder/track3.mp3","size":8901}
				],
				tracks : [
					{"path":"/Music/Lieder/track1.mp3","size":1234}
				],
				files : [],
				wifis : []
			}
		},
		created() {
			fetch(playlists_url)
				.then(response => response.json())
				.then(data => (this.playlists = data));
			fetch(root_url)
				.then(response => response.json())
				.then(data => (this.files = data));
		},
		methods: {
			bluetooth() {
				console.log("Bluetooth Toogle")
			},
			scanActiveNetworks() {
				console.log("Scanning WiFis")
			},
			openPlaylist(uuid) {
				console.log(uuid)
			},
			openDirectory(path) {
				fetch("https://raw.githubusercontent.com/janchri/wirbelwind_json/main/"+path+".json")
					.then(response => response.json())
					.then(data => (this.files = data));
				console.log(path)
			},
			deleteTrack(path) {
				console.log(path)
			},
			addTrack(path) {
				console.log(path)
			}
			
		}
	})
	app.mount('#vue_app')
