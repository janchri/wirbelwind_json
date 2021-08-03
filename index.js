const uri_wirbelwind_box = "http://192.168.188.44"
const headers = { "Content-Type" : "application/json" }

const { createApp, reactive } = Vue

const networks = createApp({
	data() {
		return {
			wifis : [],
			password: '',
			bluetooth_state : false
		}
	},
	mounted(){
		//axios.get(uri_wirbelwind_box+"/networks?list=active", {headers} )
		//.then(response => this.wifis = response.data.list_active_wifis)
		//.catch(error => {
		//	this.errorMessage = error.message;
		//	console.error("There was an error!", error);
		//})
	},
	watch: {
		bluetooth_state(state){
			console.log(state);
		}
	},
	methods: {
		addNetwork: async function (event, ssid) {
			const response = await axios.post(uri_wirbelwind_box+"/networks",
				{ SSID : ssid,
					PWD : event.target.value
				});
  	}
	}
}).mount('#app-networks')

const current_playlist = reactive({
	uuid : '',
	name : '',
	tracks : [],
	addTrack(path) {
		axios.post(uri_wirbelwind_box+"/playlist",
			{
				uuid : this.uuid,
				add : [path]
			})
			.then(response => this.tracks = response.data[0].tracks)
	    .catch(error => {
	      this.errorMessage = error.message;
	      console.error("There was an error!", error);
	    });
	},
	async deleteTrack(path) {
		const response = await axios.post(uri_wirbelwind_box+"/playlist",
			{ uuid : this.uuid,
				delete : [path]
			});
			this.tracks = response.data[0].tracks;
	},
	async setName(){
		console.log("setName(): ");
		console.log("uuid: "+this.uuid);
		console.log("name: "+this.name);
		const response = await axios.post(uri_wirbelwind_box+"/playlist",
			{ uuid : this.uuid,
				name : this.name
			});
		this.name = response.data[0].name;
	},
	reset(){
		console.log("uuid: "+this.uuid)
		console.log("name: "+this.name)
		console.log("reset(): "+name)
	}
})

const playlists = createApp({
	data() {
		return {
			playlists: [],
			current_playlist_uuid : '',
			current_playlist
		}
	},
	created() {
		axios.get(uri_wirbelwind_box+"/playlist", {headers} )
			.then(response => this.playlists = response.data)
			.catch(error => {
				this.errorMessage = error.message;
				console.error("There was an error!", error);

			})
	},
	watch: {
		async current_playlist_uuid(uuid){
			const playlist = { uuid : uuid};
			const response = await axios.post(uri_wirbelwind_box+"/playlist", playlist);
    	this.current_playlist.uuid = response.data[0].uuid;
    	this.current_playlist.name = response.data[0].name;
    	this.current_playlist.tracks = response.data[0].tracks;
		}
	},
	methods:{
		onSubmitSetName() {
			current_playlist.setName();
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
		fetch(uri_wirbelwind_box+"/files?path=/")
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
			fetch(uri_wirbelwind_box+"/files?path="+this.item.path)
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
