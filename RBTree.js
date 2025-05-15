const NodeColor = {
    RED: 'RED',
    BLACK: 'BLACK',
  };
  
  class TreeNode {
    constructor(value, parent = null) {
      this.value = value;
      this.color = NodeColor.RED; // new nodes start red
      this.parent = parent;
      this.left = null;
      this.right = null;
    }
  }
  
  class RedBlackTree {
    constructor() {
      this.root = null;
    }
  
    // Insert a new value into the tree
    insert(value) {
      let node = new TreeNode(value);
  
      // If tree is empty, set new node as root and color it black
      if (!this.root) {
        node.color = NodeColor.BLACK;
        this.root = node;
        return;
      }
  
      // Find where to put the new node
      let current = this.root;
      let parent = null;
  
      while (current) {
        parent = current;
        if (value < current.value) current = current.left; // go left if smaller
        else if (value > current.value) current = current.right; // go right if bigger
        else return; // ignore duplicates
      }
  
      // Link new node to parent
      node.parent = parent;
      if (value < parent.value) parent.left = node;
      else parent.right = node;
  
      // Fix tree rules after insertion
      this.fixInsert(node);
    }
  
    // Fix the tree after inserting a red node under a red parent
    fixInsert(node) {
      while (node !== this.root && node.parent.color === NodeColor.RED) {
        let parent = node.parent;
        let grandparent = parent.parent;
  
        // If parent is left child of grandparent
        if (parent === grandparent.left) {
          let uncle = grandparent.right;
  
          // If uncle is red, recolor parent, uncle, grandparent and move up
          if (uncle && uncle.color === NodeColor.RED) {
            parent.color = NodeColor.BLACK;
            uncle.color = NodeColor.BLACK;
            grandparent.color = NodeColor.RED;
            node = grandparent;
          } else {
            // If node is right child, rotate left at parent
            if (node === parent.right) {
              this.rotateLeft(parent);
              node = parent;
              parent = node.parent;
            }
            // Now node is left child, recolor and rotate right at grandparent
            parent.color = NodeColor.BLACK;
            grandparent.color = NodeColor.RED;
            this.rotateRight(grandparent);
          }
        } else {
          // Parent is right child of grandparent, same logic mirrored
          let uncle = grandparent.left;
  
          // If uncle is red, recolor parent, uncle, grandparent and move up
          if (uncle && uncle.color === NodeColor.RED) {
            parent.color = NodeColor.BLACK;
            uncle.color = NodeColor.BLACK;
            grandparent.color = NodeColor.RED;
            node = grandparent;
          } else {
            // If node is left child, rotate right at parent
            if (node === parent.left) {
              this.rotateRight(parent);
              node = parent;
              parent = node.parent;
            }
            // Now node is right child, recolor and rotate left at grandparent
            parent.color = NodeColor.BLACK;
            grandparent.color = NodeColor.RED;
            this.rotateLeft(grandparent);
          }
        }
      }
      // Always color root black
      this.root.color = NodeColor.BLACK;
    }
  
    // Rotate node to left around its right child
    rotateLeft(node) {
      let pivot = node.right;
      if (!pivot) return; // no right child, no rotate
  
      // Move pivot's left subtree to node's right
      node.right = pivot.left;
      if (pivot.left) pivot.left.parent = node;
  
      // Move pivot up in the tree
      pivot.parent = node.parent;
      if (!node.parent) this.root = pivot;
      else if (node === node.parent.left) node.parent.left = pivot;
      else node.parent.right = pivot;
  
      // Put node as left child of pivot
      pivot.left = node;
      node.parent = pivot;
    }
  
    // Rotate node to right around its left child
    rotateRight(node) {
      let pivot = node.left;
      if (!pivot) return; // no left child, no rotate
  
      // Move pivot's right subtree to node's left
      node.left = pivot.right;
      if (pivot.right) pivot.right.parent = node;
  
      // Move pivot up in the tree
      pivot.parent = node.parent;
      if (!node.parent) this.root = pivot;
      else if (node === node.parent.left) node.parent.left = pivot;
      else node.parent.right = pivot;
  
      // Put node as right child of pivot
      pivot.right = node;
      node.parent = pivot;
    }
  
    // Remove a node by value
    remove(value) {
      let node = this.search(value, this.root);
      if (!node) return false; // value not found
      this.deleteNode(node);
      return true;
    }
  
    // Search for node with value recursively
    search(value, node) {
      if (!node) return null; // not found
      if (value === node.value) return node; // found
      if (value < node.value) return this.search(value, node.left); // go left if smaller
      else return this.search(value, node.right); // go right if bigger
    }
  
    // Delete node and fix tree
    deleteNode(z) {
      let y = z;
      let yOriginalColor = y.color;
      let x;
      let xParent;
  
      // If no left child, replace z with right child
      if (!z.left) {
        x = z.right;
        xParent = z.parent;
        this.transplant(z, z.right);
      }
      // If no right child, replace z with left child
      else if (!z.right) {
        x = z.left;
        xParent = z.parent;
        this.transplant(z, z.left);
      }
      // If both children exist, replace with successor
      else {
        y = this.minimum(z.right);
        yOriginalColor = y.color;
        x = y.right;
        if (y.parent === z) {
          if (x) x.parent = y;
          xParent = y;
        } else {
          this.transplant(y, y.right);
          y.right = z.right;
          y.right.parent = y;
          xParent = y.parent;
        }
        this.transplant(z, y);
        y.left = z.left;
        y.left.parent = y;
        y.color = z.color;
      }
  
      // Fix tree if removed node was black
      if (yOriginalColor === NodeColor.BLACK) {
        this.fixDelete(x, xParent);
      }
    }
  
    // Replace subtree rooted at u with subtree rooted at v
    transplant(u, v) {
      if (!u.parent) this.root = v; // if u is root, v becomes root
      else if (u === u.parent.left) u.parent.left = v;
      else u.parent.right = v;
      if (v) v.parent = u.parent; // update v's parent
    }
  
    // Fix tree after deletion of a black node
    fixDelete(x, xParent) {
      // While x is not root and is black (double black situation)
      while (x !== this.root && this.getColor(x) === NodeColor.BLACK) {
        if (x === (xParent ? xParent.left : null)) {
          let w = xParent ? xParent.right : null; // sibling of x
  
          // If sibling is red, recolor and rotate left around parent
          if (this.getColor(w) === NodeColor.RED) {
            w.color = NodeColor.BLACK;
            xParent.color = NodeColor.RED;
            this.rotateLeft(xParent);
            w = xParent.right;
          }
  
          // If sibling's children are both black, recolor sibling red and move up
          if (
            this.getColor(w.left) === NodeColor.BLACK &&
            this.getColor(w.right) === NodeColor.BLACK
          ) {
            w.color = NodeColor.RED;
            x = xParent;
            xParent = x.parent;
          } else {
            // If sibling's right child is black, rotate right around sibling
            if (this.getColor(w.right) === NodeColor.BLACK) {
              if (w.left) w.left.color = NodeColor.BLACK;
              w.color = NodeColor.RED;
              this.rotateRight(w);
              w = xParent.right;
            }
            // Recolor sibling and parent, rotate left around parent
            w.color = xParent.color;
            xParent.color = NodeColor.BLACK;
            if (w.right) w.right.color = NodeColor.BLACK;
            this.rotateLeft(xParent);
            x = this.root;
          }
        } else {
          // Mirror when x is right child
          let w = xParent ? xParent.left : null;
  
          if (this.getColor(w) === NodeColor.RED) {
            w.color = NodeColor.BLACK;
            xParent.color = NodeColor.RED;
            this.rotateRight(xParent);
            w = xParent.left;
          }
  
          if (
            this.getColor(w.right) === NodeColor.BLACK &&
            this.getColor(w.left) === NodeColor.BLACK
          ) {
            w.color = NodeColor.RED;
            x = xParent;
            xParent = x.parent;
          } else {
            if (this.getColor(w.left) === NodeColor.BLACK) {
              if (w.right) w.right.color = NodeColor.BLACK;
              w.color = NodeColor.RED;
              this.rotateLeft(w);
              w = xParent.left;
            }
            w.color = xParent.color;
            xParent.color = NodeColor.BLACK;
            if (w.left) w.left.color = NodeColor.BLACK;
            this.rotateRight(xParent);
            x = this.root;
          }
        }
      }
      if (x) x.color = NodeColor.BLACK; // always color x black at end
    }
  
    // Get color of node or black if null
    getColor(node) {
      return node ? node.color : NodeColor.BLACK;
    }
  
    // Find minimum node in subtree
    minimum(node) {
      while (node.left) node = node.left;
      return node;
    }
  
    // Inorder traversal returns nodes sorted by value with colors
    inorderTraversal(node = this.root, result = []) {
      if (!node) return result;
      this.inorderTraversal(node.left, result);
      result.push({ value: node.value, color: node.color });
      this.inorderTraversal(node.right, result);
      return result;
    }
  }
  
  export default RedBlackTree;
  