	var playlists_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/playlist.json"
	var root_url = "https://raw.githubusercontent.com/janchri/wirbelwind_json/main/root.json"
	
	const app = Vue.createApp({
		data() {
			return {
				wifis : [],
				playlists: [],
				selected_playlist : '',
				tracks : [],
				files : []
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
				fetch("https://raw.githubusercontent.com/janchri/wirbelwind_json/main/tracks_"+val+".json")
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
			deleteTrack(idx) {
				console.log(idx)
			},
			addTrack(path) {
				console.log(path)
			},
			uploadFile(path,filename){
				conosle.log(path+" "+filename)
			}
		}
	})
	app.mount('#vue_app')
