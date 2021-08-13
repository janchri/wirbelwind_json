const uri_wirbelwind_box = "http://192.168.4.1" // "http://wirbelwind.box" // ""

const headers = { "Content-Type": "application/json" }

const { createApp, reactive } = Vue

const settings = createApp({
	data() {
		return {
			wifis: [],
			password: '',
			bluetooth_state: false
		}
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
		},
		scanWifis(){
			console.log("Scanning...");
			axios.get(uri_wirbelwind_box + "/networks?list=active", { headers })
			.then(response => this.wifis = response.data.list_active_wifis)
			.catch(error => {
				this.errorMessage = error.message;
				console.error("There was an error!", error);
			})
		}
	}
}).mount('#app-settings')

const reactive_playlists = reactive({
	data() {
		return {
			playlists: []
		}
	},
	update() {
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
			volume: 0,
			curr_track: 0,
			curr_timestamp: 0,
			curr_max_timestamp: 0,
			tracks: []
		}
	},
	async refresh() {
		const response = await axios.post(uri_wirbelwind_box + "/playlist", { uuid: this.uuid });
		this.uuid = response.data[0].uuid;
		this.name = response.data[0].name;
		this.tracks = response.data[0].tracks;
		this.volume = response.data[1].volume;
		this.curr_track = response.data[1].curr_track;
		this.curr_timestamp = response.data[1].curr_timestamp;
		this.curr_max_timestamp = response.data[1].curr_max_timestamp;
	},
	async updateName(name) {
		const response = await axios.post(uri_wirbelwind_box + "/playlist",
			{
				uuid: this.uuid,
				name: name
			});
		this.name = response.data[0].name;
	},
	async updateCurrTimestamp() {
		const response = await axios.post(uri_wirbelwind_box + "/playlist",
			{
				uuid: this.uuid,
				curr_timestamp: this.curr_timestamp
			});
		this.curr_timestamp = response.data[1].curr_timestamp;
	},
	async updateCurrTrack(index) {
		const response = await axios.post(uri_wirbelwind_box + "/playlist",
			{
				uuid: this.uuid,
				curr_track: index,
				curr_timestamp: 0
			});
		this.curr_track = response.data[1].curr_track;
		this.curr_timestamp = response.data[1].curr_timestamp;
		this.curr_max_timestamp = response.data[1].curr_max_timestamp;
	},
	async updateVolume() {
		axios.post(uri_wirbelwind_box + "/playlist",
			{
				uuid: this.uuid,
				volume: this.volume
			})
			.then(response => this.volume = response.data[1].volume)
			.catch(error => {
				this.errorMessage = error.message;
				console.error("There was an error!", error);
			});
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
			countDown: 10,
			reactive_playlists,
			reactive_current_playlist
		}
	},
	created() {
		reactive_playlists.update();
	},
	computed: {
		update_uuid: {
			get() {
				//console.log("getter");
				return reactive_current_playlist.uuid;
			},
			set(uuid) {
				//console.log("setter");
				reactive_current_playlist.uuid = uuid;
				reactive_current_playlist.refresh();
			}
		},
		update_name: {
			get() {
				return reactive_current_playlist.name;

			},
			set(name) {
				reactive_playlists.update();
				reactive_current_playlist.updateName(name);
			}
		}
	},
	methods: {
		onChangeCurrTimestamp() {
			reactive_current_playlist.updateCurrTimestamp();
		},
		onChangeVolume() {
			reactive_current_playlist.updateVolume();
		},
		onChangeTrack(index) {
			reactive_current_playlist.updateCurrTrack(index);
		},
		liveData(){
			setInterval(() => {
				reactive_current_playlist.refresh();
			  }, 5000);
		}
	}
})
manage_playlists.mount('#app-playlists')

const files = createApp({
	data() {
		return {
			treeData: [],
			reactive_current_playlist,
			files: ''
		}
	},
	created() {
		fetch(uri_wirbelwind_box + "/files?path=/")
			.then(response => response.json())
			.then(data => (this.treeData = data));
	},
	methods: {
	}
})

files.component("tree-item", {
	template: `
	<li v-if="!this.item.deleted">
	<div>
	{{ item.path.split('/').pop() }}
	<img src="icons/material-icons/folder_open_black_24dp.svg" v-if="isFolder && isOpen" 
	:class="{folder: isFolder}" class="add_curser_pointer"
	@click="toggle">
	<img src="icons/material-icons/folder_black_24dp.svg" v-if="isFolder && !isOpen" 
	:class="{folder: isFolder}" class="add_curser_pointer"
	@click="toggle">
	<img src="icons/material-icons/create_new_folder_black_24dp.svg" v-if="isFolder" @click="addFolder()" class="addfolder add_curser_pointer" :class="{folder: isFolder}">
	<img src="icons/material-icons/upload_file_black_24dp.svg" v-if="isFolder" @click="toggleFileUploadDialog()" class="uploadfile add_curser_pointer" :class="{folder: isFolder}">
	<img src="icons/material-icons/playlist_add_black_24dp.svg" v-if="!isFolder" @click="addTrackToPlaylist()" class="addtrack add_curser_pointer">
	<img src="icons/material-icons/remove_black_24dp.svg" v-if="!isFolder" @click="deleteFileFromFS()" class="deletefile add_curser_pointer">
	<div class="container" v-show="isOpenFileUploadDialog">
	<div class="large-12 medium-12 small-12 cell">
	<label>Files
	<input name='uploadfiles' type="file" id="files" ref="files" multiple v-on:change="handleFilesUpload()" />
	</label>
	<button v-on:click="submitFiles(path)">Submit</button>
	</div>
	</div>
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
			isOpen: false,
			isOpenFileUploadDialog: false
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
			if (reactive_current_playlist.uuid != undefined) {
				reactive_current_playlist.addTracks(this.item.path);
			} else {
				alert("Select playlist first");
			}
		},
		async deleteFileFromFS() {
			path = this.item.path.split("/"); path.pop();
			response = await axios.patch(uri_wirbelwind_box + "/files?path=" + path.join("/"), { delete: this.item.path });
			this.item.deleted = true;
		},
		toggleFileUploadDialog() {
			this.isOpenFileUploadDialog = !this.isOpenFileUploadDialog;
		},
		/*
		Submits all of the files to the server
	  */
		submitFiles() {
			/*
			  Initialize the form data
			*/
			let formData = new FormData();

			/*
			  Iteate over any file sent over appending the files
			  to the form data.
			*/
			for (var i = 0; i < this.files.length; i++) {
				let file = this.files[i];

				formData.append('files[' + i + ']', file);
			}

			// Add Path
			//formData.append("path", "test");

			/*
			  Make the request to the POST /multiple-files URL
			*/
			success = false;
			axios.post(uri_wirbelwind_box + this.item.path,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			).then(function () {
				console.log('SUCCESS!!');
			})
				.catch(function () {
					console.log('FAILURE!!');
				});

			this.loadChildren();
		},
		/*
		  Handles a change on the file upload
		*/
		handleFilesUpload() {
			this.files = this.$refs.files.files;
		}
	}
})
files.mount('#app-files')
