class WFC {
  EDGE = -Infinity; // arbitrary non-collision value

  modules = [];
  addModule(value, edges) {
    this.modules.push({ value, edges });
    // TODO: Trigger restart or re-resolve
  }

  resolveCB(value, location) {
    // Detect when done
    if (--this.unresolved === 0) {
      return this.callWhenFinished(this.space.map(slot => slot.value));
    }
    // TODO: make n-dimensional
    if (location > 0) {
      this.space[location - 1].filter("right", value);
    }
    if (location + 1 < this.space.length) {
      this.space[location + 1].filter("left", value);
    }
    // TODO: Detect when stuck
  }

  defineSpace(...dimensions) {
    this.spaceDimensions = dimensions;
    this.unresolved = dimensions.reduce((prod, curr) => prod * curr, 1);
    // TODO: make n-dimensional
    this.space = new Array(dimensions[0])
      .fill(0)
      .map((_, i) => new WFCSlot(this.modules, i, this.resolveCB.bind(this)));
    // Resolve edges
    this.space[0].filter("left", this.EDGE);
    this.space[this.space.length - 1].filter("right", this.EDGE);
  }

  done(func) {
    this.callWhenFinished = func;
  }
}

class WFCSlot {
  constructor(modules, location, resolveCB) {
    this.modules = modules;
    this.value = null; //
    this.location = location;
    this.resolveCB = resolveCB;
  }

  resolve(val) {
    this.value = val;
    delete this.modules; // memory and output cleanup
    this.resolveCB(val, this.location);
  }

  filter(dir, value) {
    // Already resolved
    if (this.value !== null) {
      return;
    }
    // Now that "val" was placed "dir" of here, what does that rule out?
    this.modules = this.modules.filter(
      m => typeof m.edges[dir] !== "undefined" && m.edges[dir].includes(value)
    );
    // no possible pieces remain in this slot
    if (this.modules.length === 0) {
      throw new Error("IMPOSSIBLE MODULE SET");
    }
    // only one left? RESOLVE!
    if (this.modules.length === 1) {
      this.resolve(this.modules[0].value);
    }
  }
}
