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
