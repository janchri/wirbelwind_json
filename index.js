const uri_wirbelwind_box = "http://wirbelwind.box" //"http://192.168.4.1" //
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
		/*axios.get(uri_wirbelwind_box + "/networks?list=active", { headers })
			.then(response => this.wifis = response.data.list_active_wifis)
			.catch(error => {
				this.errorMessage = error.message;
				console.error("There was an error!", error);
			})*/
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
			get() {
				//console.log("getter");
				return reactive_current_playlist.uuid;
			},
			set(uuid) {
				//console.log("setter");
				reactive_current_playlist.update(uuid);
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
		change() {
			console.log("change");
		},
		setNameOfCurrent() {
			reactive_current_playlist.setNameForSelectedPlaylist();
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
	<img src="icons/folder_open.svg" v-if="isFolder && isOpen" 
	:class="{folder: isFolder}"
	@click="toggle">
	<img src="icons/folder_closed.svg" v-if="isFolder && !isOpen" 
	:class="{folder: isFolder}"
	@click="toggle">
	<img src="icons/upload.svg" v-if="isFolder" @click="toggleFileUploadDialog()" class="uploadfile">
	<img src="icons/addtrack.svg" v-if="!isFolder" @click="addTrackToPlaylist()" class="addtrack">
	<img src="icons/delete.svg" v-if="!isFolder" @click="deleteFileFromFS()" class="deletefile">
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
