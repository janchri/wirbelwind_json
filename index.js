const { createApp, reactive } = Vue

const networks = createApp({
	data() {
		return {
			wifis : []
		}
	},
	methods: {
		bluetooth() {
			console.log("Bluetooth Toogle")
		},
		scanActiveNetworks() {
			console.log("Scanning WiFis")
		}
	}
}).mount('#app-networks')

const current_playlist = reactive({
	tracks : [],
	addTrack(path) {
		console.log("addTrack(): "+path)
	},
	deleteTrack(idx) {
		console.log("deleteTrack(): "+idx)
	},
	setName(name){
		console.log("setName(): "+name)
	},
	reset(){
		console.log("reset(): "+name)
	}
})

const playlists = createApp({
	template: `
	<div id="id_playlists">
	<select v-model="selected_playlist">
	<option disabled value="">Choose playlist</option>
	<option v-for="playlist in playlists" :value="playlist.uuid">
	{{ playlist.name }}
	</option>
	</select>
	</div>
	<p>Tracks</p>
	<div id="id_tracks" v-for="(track,index) in current_playlist.tracks">
	<button @click="current_playlist.deleteTrack(index)">{{ track }}</button>
	</div>
	`
	,
	data() {
		return {
			playlists: [],
			selected_playlist : '',
			current_playlist
		}
	},
	created() {
		fetch("http://wirbelwind.box/playlist")
		.then(response => response.json())
		.then(data => (this.playlists = data));
	},
	watch: {
		selected_playlist(val){
			console.log(val)
			const requestOptions = {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ uuid: val })
			};
			fetch("http://wirbelwind.box/playlist", requestOptions)
			.then(response => response.json())
			.then(data => (this.current_playlist.tracks = data[0].tracks));
		}
	}
})
playlists.mount('#app-playlists')

const files = createApp({
	data() {
		return {
			treeData: [],
			current_playlist
		}
	},
	created() {
		fetch('http://wirbelwind.box/files?path=/')
		.then(response => response.json())
		.then(data => (this.treeData = data));
	}
})

files.component("tree-item", {
	template: `
	<li>
	<div
	:class="{folder: isFolder}"
	@click="toggle">
	{{ item.path }}
	<span v-if="isFolder">[{{ isOpen ? '-' : '+' }}]</span>
	<button v-if="!isFolder" @click="addTrackToPlaylist()">+</button>
	</div>
	<ul v-show="isOpen" v-if="isFolder">
	<tree-item
	class="item"
	v-for="(child, index) in item.children"
	v-bind:key="index"
	v-bind:item="child"
	></tree-item>
	</ul>
	</li>`,
	props: {
		item: Object
	},
	data() {
		return {
			isOpen: false
		};
	},
	computed: {
		isFolder() {
			return (this.item.children && this.item.children.length) || this.item.type === 'd';
		}
	},
	methods: {
		toggle() {
			if (this.isFolder) {
				this.isOpen = !this.isOpen;
				if (this.isOpen) {
					this.loadChildren();
				}
			}
		},
		loadChildren() {
			fetch("http://wirbelwind.box/files?path="+this.item.path)
			.then(response => response.json())
			.then(data => this.item.children = data);
		},
		addTrackToPlaylist(){
			console.log(this.item.path)
			current_playlist.addTrack(this.item.path)
		},
		uploadFile(path,filename){
			console.log(path+" "+filename)
		}
	}
})
files.mount('#app-files')
