/** Dispatch event on click outside of node */
export function clickOutside(node: any) {
    
  const handleClick = (event: any) => {    
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
        console.log(event.target);
        
      node.dispatchEvent(new CustomEvent("click_outside", node), event.target);
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
