# Let's Build: Wave Function Collapse, Part 1

I've been diving down the rabbit hole on two nerdy topics lately: escape rooms and Wave Function Collapse. I've decided I want to build an engine of the latter to help me design the former and I'm offering you a ticket on the train! Buckle up!

I will be posting all of the code to GitHub. [Here are the results of today's efforts](https://github.com/crhallberg/wfc-devto/tree/post1).

## What is Wave Function Collapse?

I recently started following _Bad North_ developer Oskar Stålberg on Twitter and one of the first tweets I saw was this fun town building tool he's working on:

https://twitter.com/OskSta/status/1189902695303458816

That's amazing! How is he doing that? WFC? A brief stroll down the timeline revealed the answer: Wave Function Collapse.

https://twitter.com/martinpi/status/1155848175082713089

A walk through the attached code base made it clear that I wasn't going to able to jump into this without a guide or atleast some context. Thankfully, Oskar came back to my rescue because he used WFC to create the island layouts in _Bad North_!

https://www.youtube.com/watch?v=0bcZb-SsnrA

You can probably watch this talk and learn everything you need to know BUT if you want to see someone else take that journey and fail instead of you, hop aboard!

## What is WaveFunctionCollapse?

WaveFunctionCollapse is a very fancy name for a relatively simple spatial algorithm. It is a very good way to fill a space while following a strict set of rules. How does it work?

**First**, you need to make your **modules**. Modules are the pieces you want to fill your potential space with. Each has some content value but also some data on what pieces it can connect to.

For example, look at these pieces from the board game _Carcassone_.

![Some sweet board game tiles](https://images.zmangames.com/filer_public/10/99/1099a29c-51a1-4cc0-9c25-4c8503e6ea38/zm7819_tiles.png)

_If this example make no sense, [here's how you play Carcassone](https://www.youtube.com/watch?v=-74FYj21JVg)_

Each tile has its own content but in order to place these pieces you need to match their edges. For example, you could put the piece on the left below the piece on the right because the roads match up! You couldn't put it above the piece of the right because the road and the city don't match up!

**Next**, you want to fill your space with every module. Let's call each spot in your space a **slot**. At the start, every slot is still considered empty but could potentially become any of the modules at the end.

The quantum super-position of all of these modules is temporary because we are about to **filter and resolve** each slot. During this recursive process, we will apply filters to each slot, removing modules from the pool of the potential modules they could be at the end of this process. When just one potential module remains in a slot's pool, we **resolve** that slot by filling it with that module.

Filling a slot causes a chain reaction as we filter all the neighboring slots to make sure all the modules incompatible with the placed modules are removed from the pool. This might cause those slots to resolve, resolving the space even further.

Usually, we'll start by making sure all the slots along the edges of the space contain only edge-compatible pieces but this won't always be enough to completely resolve all the slots. **When** the space reaches an unfinished equalibrium, we'll can use a heuristic to choose a slot and resolve it to one of its remaining potential modules. If we've filtered properly, this can be done randomly and guarantee a compatible piece! Pretty sweet!

## Let's break it down

Ok. That was a lot so let's break down what we need.

1.  We need to be able to define modules.
1.  We need to be able to define a space and fill it with potential and placed modules.
1.  We need to be able to run a heuristic on the space in order to place the best next piece.

## Starting Architecture

I'm going to start by imagining how the API would work for a basic example.

```javascript
const word = new WFC();

// heuristic
word.stuck((space) => {
  let randomSlot = /* some hocus pocus */;
  randomSlot.resolve(value); // resolve individual slots
});

// callback when done
word.done(space => {
  document.getElementById("output").innerHTML = space.join("");
});

// Add modules with mapped edges so edges can be labelled anything
word.addModule("A", { left: [word.EDGE], right: ["B", "C"] }); // Constant for edges
word.addModule("B", { left: ["A", "C"], right: ["A", "C"] });
word.addModule("C", { left: ["A", "B"], right: [word.EDGE] });

// Kick off with a space
word.defineSpace(3);
```

## Let's Get Started

So I'm going to make two objects:

```javascript
class WFC {
  EDGE = -Infinity; // arbitrary non-collision value

  modules = [];
  addModule(value, edges) { }

  resolveCB(value, location) { }

  defineSpace(...dimensions) { }

  done(func) { }
}

class WFCSlot {
  constructor(modules, location, resolveCB) { }

  resolve(val) { }

  filter(dir, value) { }
}

```

I'm going to start with a 1-dimensional space for now and we'll ramp that up in a future post. If everything goes well, the example above will resolve to "ABC" with no further intervention... and... \*drum roll\*...

```html
Brand New Word: ABC
```

It's alive! The automatic edge filtering set A on the left and C on the right leaving B the only choice for the middle! I'm giving out high fives. Post your address on this web zone if you want a high five.

Alright, let's run another test! A waltz perhaps!

```javascript
const waltz = new WFC();

waltz.addModule("one", { left: ["three"], right: ["two"] });
waltz.addModule("two", { left: ["one"], right: ["three"] });
waltz.addModule("three", { left: ["two"], right: ["one"] });

waltz.defineSpace(16);
```

Right away, I ran into a problem with the edges. If I don't add EDGE to left edge of at least one module and the right edge of another, I get no results. If your modules are edge agnostic, you have to EDGE to every edge of every module!

This is a problem I can solve by either removing the automatic edge filtering or by adding more ways to express edges. I'll come back to this later.

```javascript
waltz.addModule("one", { left: [waltz.EDGE, "three"], right: [waltz.EDGE, "two"] });
waltz.addModule("two", { left: [waltz.EDGE, "one"], right: [waltz.EDGE, "three"] });
waltz.addModule("three", { left: [waltz.EDGE, "two"], right: [waltz.EDGE, "one"] });
```

With that resolved, it still looks like this one will need some coaxing...

```javascript
waltz.space[0].resolve("one");
```

Voila! Looks like we have our basic core. Next time I'll make it interactive and visual!
