function on_browser_action(){
  chrome.browserAction.onClicked.addListener((tab)=>{
    chrome.tabs.create({
      url : chrome.runtime.getURL("index.html")
    })
  })
}

on_browser_action()

(async (chrome) => {
  async function get_domain_map(map2) {
    function traverse(tree, map) {
      //console.log(tree.id,tree.title)
      for (let i in tree.children) {
        let child = tree.children[i];
        if (child.url) {
          let exec = /\/\/(.+?)\//.exec(child.url);
          if (!exec || exec.length <= 1) {
            console.error('error', child, exec)
          } else {
            let domain = exec[1]
            if (!map[domain]) {
              map[domain] = []
            }
            map[domain].push(child)
          }
        }
        traverse(child, map)
      }
    }

    let tree2 = await new Promise((r) => chrome.bookmarks.getTree((callback) => {
      r(callback)
    }));

    traverse(tree2[0], map2)
  }

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

  async function remove_duplicate_folders(domain_map){
    console.log('remove_duplicate_folders', domain_map)
    for(let domain in domain_map){
      for(let index in domain_map[domain]) {
        let thus = domain_map[domain][index];
        let parent = await get_bookmark(thus.parentId)
        let title = parent.title;
        let parent_parent =  await get_bookmark(parent.parentId);
        let last_parent_id = -1;
        while(parent_parent != null && parent_parent.title == title){
          last_parent_id = parent_parent.id;
          parent_parent = await get_bookmark(parent_parent.parentId);
        }
        if(last_parent_id > 0){
          chrome.bookmarks.move(thus.id, {
            parentId : last_parent_id
          })
        }
      }
    }
  }


  async function do_classfiy_by_domain() {
    let domain_map = {};
    await get_domain_map(domain_map)
    console.log(domain_map)
    let new_map = group_by(domain_map);
    console.log(new_map)
    await create_folder(new_map)
  }

  function on_created_event(){
    chrome.bookmarks.onCreated.addListener((id,bm)=>{
      setTimeout(do_classfiy_by_domain, 2000);
    })
  }



  on_created_event()

})(chrome)


