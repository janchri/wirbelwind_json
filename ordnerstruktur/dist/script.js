// demo data
var treeData = [
{
	  "type" : "d",
	  "path" : "Music"
},
{
	"type" : "d",
	"path" : "www"
},
{
	"type" : "d",
	"path" : ".test"
},
{
	"type" : "d",
	"path" : ".backup"
}
];
                
Vue.component("tree-item", {
  template: '#item-template',
  props: {
    item: Object
  },
  data: function() {
    return {
      isOpen: false
    };
  },
  computed: {
    isFolder: function() {
      return (this.item.children && this.item.children.length) || this.item.type === 'd';
    }
  },
  methods: {
    toggle: function() {
      if (this.isFolder) {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
          this.loadChildren();
        }
      }
    },
    makeFolder: function() {
      if (!this.isFolder) {
        this.$emit("make-folder", this.item);
        this.isOpen = true;
      }
    },
    loadChildren: function() {
      fetch("https://raw.githubusercontent.com/janchri/wirbelwind_json/main/"+this.item.path+".json")
					.then(response => response.json())
					.then(data => this.$set(this.item, 'children', data));
    }
  }
});

new Vue({
  el: "#demo",
  data: {
      treeData: treeData
  },
  methods: {
    makeFolder: function(item) {
      item.children = [];
      this.addItem(item);
    },
    addItem: function(item) {
      item.children.push({
        name: {
	        "type" : "d",
	        "path" : "New folder"
          }
      });
    }
  }
});