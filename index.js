const app = Vue.createApp({
	data() {
		return {
			wifis : [],
			playlists: [],
			selected_playlist : '',
			tracks : [],
			treeData: []
		}
	},
	created() {
		fetch("http://wirbelwind.box/playlist")
			.then(response => response.json())
			.then(data => (this.playlists = data));
		fetch('http://wirbelwind.box/files?path=/')
			.then(response => response.json())
			.then(data => (this.treeData = data));
	},
	watch:{
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
                .then(data => (this.tracks = data[0].tracks));
		}
	},
	methods: {
		bluetooth() {
			console.log("Bluetooth Toogle")
		},
		scanActiveNetworks() {
			console.log("Scanning WiFis")
		},
        addTrack(path) {
			console.log("addTrack: "+path)
		},
		deleteTrack(idx) {
			console.log(idx)
		}
    }
})

app.component("tree-item", {
    template: '#item-template',
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
        addTrackToPlaylist(){
            console.log(this.item.path)
            // hier müsste jetzt addTrack(path) aufgerufen werden...
        },
		uploadFile(path,filename){
			console.log(path+" "+filename)
		},
	    loadChildren() {
            fetch("http://wirbelwind.box/files?path="+this.item.path)
                .then(response => response.json())
                .then(data => this.item.children = data);
        }
    }
})
app.mount('#vue_app')
