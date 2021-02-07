import * as bm from '../js/bookmark.js'
import utils from "../js/utils";


(async (chrome) => {
  let enableAuto = false;

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
          //以父亲节点创建map
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

  async function iter(domain, parentId, bm){
    //如果父亲已经是域名文件夹就跳过
    let parent = await get_bookmark(parentId);
    if(parent.title === domain){
      return ;
    }
    //获取所有兄弟没有域名文件夹就创建文件夹
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
    //移动
    chrome.bookmarks.move(bm.id, {
      parentId : id
    })
  }

  async function create_folder(new_map, newbm){
    for(var i in new_map){
      for(var j in new_map[i]) {
        for (var x in new_map[i][j]) {
          if(new_map[i][j].length > 1) {
            await iter(i, j, new_map[i][j][x])
          }
        }
      }
    }
    let domain = utils.get_domain_from_url(newbm.url)
    if(domain) {
      let id = await get_domain_folder_id(newbm.parentId, domain);
      if(id > 0){
        chrome.bookmarks.move(newbm.id, {
          parentId : id
        })
      }
    }

  }
  async function do_classfiy_by_domain(newbm) {
    let domain_map = {};
    await bm.get_domain_map(domain_map)
    console.log(domain_map)
    let new_map = group_by(domain_map);
    console.log(new_map)
    await create_folder(new_map, newbm)
  }

  function on_created_event(){
    console.log('on created event set up - ' + new Date())
    chrome.bookmarks.onCreated.addListener((id,bm)=>{
      setTimeout(async ()=>{
        if(enableAuto) {
          do_classfiy_by_domain(await get_bookmark(id))
        }
      }, 2000);
    })
  }

  function on_message_event(){
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {

        if (request.enableAutoClassify)
          enableAuto = request.enableAutoClassify;
        console.log(sender.tab ?
          "from a content script:" + sender.tab.url :
          "from the extension enable:" + enableAuto);
          sendResponse({farewell: "classify switch okay"});
      }
    );
  }


  on_created_event()
  on_message_event()

})(chrome)


