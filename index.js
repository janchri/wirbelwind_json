const uri_wirbelwind_box = "http://localhost" //"http://192.168.4.1" //"http://wirbelwind.box"
const headers = { "Content-Type": "application/json" }

const { createApp, reactive } = Vue

const networks = createApp({
	data() {
		return {
			wifis: [],
			password: '',
			bluetooth_state: false
		}
	},
	mounted() {
		axios.get(uri_wirbelwind_box + "/networks?list=active", { headers })
			.then(response => this.wifis = response.data.list_active_wifis)
			.catch(error => {
				this.errorMessage = error.message;
				console.error("There was an error!", error);
			})
	},
	watch: {
		bluetooth_state(state) {
			console.log(state);
		}
	},
	methods: {
		addNetwork: async function (event, ssid) {
			const response = await axios.post(uri_wirbelwind_box + "/networks",
				{
					SSID: ssid,
					PWD: event.target.value
				});
		}
	}
}).mount('#app-networks')

const reactive_playlists = reactive({
	data() {
		return {
			playlists: []
		}
	},
	update(){
		axios.get(uri_wirbelwind_box + "/playlist", { headers })
		.then(response => this.playlists = response.data)
		.catch(error => {
			this.errorMessage = error.message;
			console.error("There was an error!", error);
		})
	}
})

const reactive_current_playlist = reactive({
	data() {
		return {
			uuid: '',
			name: '',
			tracks: []
		}
	},
	async update(uuid) {
		const response = await axios.post(uri_wirbelwind_box + "/playlist", { uuid: uuid });
		this.uuid = response.data[0].uuid;
		this.name = response.data[0].name;
		this.tracks = response.data[0].tracks;
	},
	async updateName(name) {
		const response = await axios.post(uri_wirbelwind_box + "/playlist",
			{
				uuid: this.uuid,
				name: name
			});
		this.name = response.data[0].name;

	},
	addTracks(path) {
		axios.post(uri_wirbelwind_box + "/playlist",
			{
				uuid: this.uuid,
				add: [path]
			})
			.then(response => this.tracks = response.data[0].tracks)
			.catch(error => {
				this.errorMessage = error.message;
				console.error("There was an error!", error);
			});
	},
	async deleteTracks(path) {
		const response = await axios.post(uri_wirbelwind_box + "/playlist",
			{
				uuid: this.uuid,
				delete: [path]
			});
		this.tracks = response.data[0].tracks;
	},
	resetSelectedPlaylist() {

	},
	deleteSelectedPlaylist() {

	}

})

const manage_playlists = createApp({
	data() {
		return {
			reactive_playlists,
			reactive_current_playlist
		}
	},
	created() {
		reactive_playlists.update();
	},
	computed: {
		update_uuid: {
			get(){
				//console.log("getter");
				return reactive_current_playlist.uuid;
			},
			set(uuid){
				//console.log("setter");
				reactive_current_playlist.update(uuid);
			}
		},
		update_name: {
			get() {
				return reactive_current_playlist.name;

			},
			set(name){
				reactive_playlists.update();
				reactive_current_playlist.updateName(name);
			}
		}
	},
	methods: {
		change() {
			console.log("change");
		},
		setNameOfCurrent() {
			reactive_current_playlist.setNameForSelectedPlaylist();
		},
		delete() {

		}
	}
})
manage_playlists.mount('#app-playlists')

const files = createApp({
	data() {
		return {
			treeData: [],
			reactive_current_playlist
		}
	},
	created() {
		fetch(uri_wirbelwind_box + "/files?path=/")
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
			fetch(uri_wirbelwind_box + "/files?path=" + this.item.path)
				.then(response => response.json())
				.then(data => this.item.children = data);
		},
		addTrackToPlaylist() {
			console.log(this.item.path)
			reactive_current_playlist.addTracks(this.item.path)
		},
		uploadFile(path, filename) {
			console.log(path + " " + filename)
		}
	}
})
files.mount('#app-files')
