export async function get_domain_map(map2) {
  function traverse(tree, map) {
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


export async function remove_duplicate_folders(domain_map){
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
