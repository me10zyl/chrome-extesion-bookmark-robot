import * as bm from '../js/bookmark.js'


(async (chrome) => {

  chrome.browserAction.onClicked.addListener((tab)=>{
    chrome.tabs.create({
      url : chrome.runtime.getURL("index.html")
    })
  })

  function group_by(domain_map){
    let new_map = {};
    for(let key in domain_map){
      let array = domain_map[key];
      if(array.length > 1){
        //console.log(domain_map[key])
        if(!new_map[key]){
          new_map[key] = {}
        }
        for(let arrayIndex in array) {
          let item = array[arrayIndex]
          if (!new_map[key][item.parentId]) {
            new_map[key][item.parentId] = []
          }
          new_map[key][item.parentId].push(item)
        }
      }
    }
    return new_map;
  }

  async function get_domain_folder_id(parentId, domain) {
    let children = await new Promise((r) => chrome.bookmarks.getChildren(parentId, (callback) => {
      r(callback)
    }));
    let id = -1;
    for (let i in children) {
      if (children[i].title === domain) {
        id = children[i].id
        break;
      }
    }
    return id;
  }

  async function get_bookmark(parentId) {
    let parent = await new Promise((r) => {
      chrome.bookmarks.get(parentId, (c) => {
        r(c);
      })
    })
    parent = parent[0]
    return parent;
  }

  async function  iter(domain, parentId, bm){
    let parent = await get_bookmark(parentId);
    if(parent.title === domain){
      return ;
    }
    let id = await get_domain_folder_id(parentId, domain);
    if(id < 0){
      let newCreated = await new Promise((r)=>{chrome.bookmarks.create({
        parentId : parentId,
        title : domain
      }, (c)=>{
        r(c);
      })})
      id = newCreated.id;
    }
    chrome.bookmarks.move(bm.id, {
      parentId : id
    })
  }

  async function create_folder(new_map){
    for(var i in new_map){
      for(var j in new_map[i]){
        if(new_map[i][j].length > 1) {
          for (var x in new_map[i][j]) {
            await iter(i,j, new_map[i][j][x])
          }
        }
      }
    }
  }


  async function do_classfiy_by_domain() {
    let domain_map = {};
    await bm.get_domain_map(domain_map)
    console.log(domain_map)
    let new_map = group_by(domain_map);
    console.log(new_map)
    await create_folder(new_map)
  }

  function on_created_event(){
    console.log('on created event set up')
    chrome.bookmarks.onCreated.addListener((id,bm)=>{
      setTimeout(do_classfiy_by_domain, 2000);
    })
  }

  on_created_event()

})(chrome)


