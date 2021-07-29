	var playlists_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/playlist.json"
	var tracks_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/tracks.json"
	var root_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/root.json"
	
	const app = Vue.createApp({
		data() {
			return {
				playlists: [],
				selected_playlist : '',
				tracks : [],
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
		watch:{
			selected_playlist(val){
				console.log(val)
				fetch(tracks_url)
					.then(response => response.json())
					.then(data => (this.tracks = data));
			}
		},
		methods: {
			bluetooth() {
				console.log("Bluetooth Toogle")
			},
			scanActiveNetworks() {
				console.log("Scanning WiFis")
			},
			openSubDirectory(path) {
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
